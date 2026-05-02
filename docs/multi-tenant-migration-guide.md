# Migration Guide: Using Tenant Database in Agency Modules

## Overview

This guide explains how to migrate existing agency modules to use tenant-scoped database queries when the multi-tenant database-per-tenant architecture is enabled.

## Current Pattern (Single Database)

```typescript
// Current pattern - uses master database
import { prisma } from '@repo/database';
import { getContextAgency } from '@/lib/hono/context';

const agency = getContextAgency();
const buses = await prisma.bus.findMany({
  where: { agencyId: agency.id }
});
```

## New Pattern (Tenant Database)

### Step 1: Add Tenant Middleware

In your module routes, add the `resolveTenant` middleware:

```typescript
// routes.ts
import { resolveTenant } from '@/middlewares/tenant';

export const BusesRoutes = {
  getListBuses: createRouteConfig({
    description: 'List buses for agency',
    guard: [isAgency, resolveTenant],  // Add resolveTenant
    responses: { ... }
  }),
};
```

### Step 2: Use Tenant Database Client

```typescript
// handlers.ts
import { getContextTenant } from '@/lib/tenant/context';
import { getTenantDb } from '@/lib/tenant';
import { prisma } from '@repo/database';

const busHandler = new Hono<HonoEnv>()
  .get('/', ...BusesRoutes.getListBuses, async (ctx) => {
    const tenant = getContextTenant();
    const tenantDb = await getTenantDb();
    
    const buses = await tenantDb.bus.findMany({
      where: { agencyId: tenant.id }
    });
    
    return ctx.json({ data: buses });
  });
```

### Step 3: Handle Multi-Database Queries

Some queries need both master DB (for auth) and tenant DB (for data):

```typescript
const busHandler = new Hono<HonoEnv>()
  .get('/:identifier', async (ctx) => {
    const tenant = getContextTenant();
    const agency = getContextAgency();  // From master DB
    const tenantDb = await getTenantDb();  // From tenant DB
    
    // Validate ownership via master DB
    if (agency.tenantId !== tenant.id) {
      throw new AppError({ code: 'tenant:mismatch' });
    }
    
    // Get data from tenant DB
    const bus = await tenantDb.bus.findUnique({
      where: { id: ctx.req.param('identifier') }
    });
    
    return ctx.json({ data: bus });
  });
```

## Query Scope Utility

For automatic tenant filtering, use the query scope utility:

```typescript
import { withTenantScope, createTenantFilter } from '@repo/database';

const buses = await withTenantScope(prisma, { tenantId: tenant.id }, (db) => 
  db.bus.findMany({
    where: createTenantFilter(tenant.id, agency.id)
  })
);
```

## Example: Updated Buses Module

```typescript
// apps/server/src/modules/agency/buses/handlers.ts
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BusSeatType, TripStatus } from '@repo/shared/constants';
import { createBusSchema, updateBusSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { getContextTenant, getTenantDb } from '@/lib/tenant';
import { BusesRoutes } from './routes';

const busHandler = new Hono<HonoEnv>()
  .get('/', ...BusesRoutes.getListBuses, async (ctx) => {
    const agency = getContextAgency();
    const tenant = getContextTenant();
    const tenantDb = await getTenantDb();

    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const [data, total] = await Promise.all([
      tenantDb.bus.findMany({
        include: {
          _count: { select: { seats: true, trips: true } },
          seats: { select: { id: true, type: true } },
          trips: {
            select: { arrivalTime: true, departureTime: true, id: true, name: true },
            take: 1,
            where: { status: TripStatus.ONGOING },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where: {
          agencyId: agency.id,
          ...(query.status ? { status: query.status } : { status: { not: 'DELETED' } }),
        },
      }),
      tenantDb.bus.count({
        where: { agencyId: agency.id },
      }),
    ]);

    return ctx.json({
      data,
      pagination: getPaginationMeta({ limit: query.limit, page: query.page, total }),
    }, 200);
  });
```

## Migration Phases

### Phase 1: Add Tenant Context (Non-Breaking)
- Add `resolveTenant` middleware to routes
- Add `ctx.var.tenant` type
- No changes to queries yet

### Phase 2: Dual Read (Read from Tenant DB)
- Implement `getTenantDb()` function
- Start reading from tenant DB for non-critical data
- Keep writes on master DB

### Phase 3: Full Migration
- Move all tenant-scoped data to tenant DB
- Update all queries to use tenant DB client
- Remove agencyId filtering where applicable

### Phase 4: Cleanup
- Remove dual-write logic
- Archive old data
- Update documentation

## Troubleshooting

### Connection Issues
```typescript
// Check tenant DB health
const isHealthy = await tenantConnectionManager.healthCheck();
```

### Missing Tenant Context
```typescript
// Always check tenant exists
const tenant = ctx.var.tenant;
if (!tenant) {
  throw new AppError({ code: 'tenant:required' });
}
```

### Query Errors
```typescript
// Wrap in try-catch for better error messages
try {
  const buses = await tenantDb.bus.findMany({ where: { agencyId: agency.id } });
} catch (error) {
  logger.error('Tenant DB query failed', { tenantId: tenant.id, error });
  throw new AppError({ code: 'tenant:connection_failed' });
}
```
