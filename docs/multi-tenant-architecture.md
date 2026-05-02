# Multi-Tenant Database Isolation Architecture

## Overview

This document specifies the architecture for implementing database-per-tenant isolation in the Viago monorepo. When an agency request is approved by an Alpha or Super Admin, a dedicated PostgreSQL database is provisioned for that agency.

## Goals

1. **Tenant Isolation**: Each tenant (agency) has its own database
2. **Shared Codebase**: All tenants use the same application interfaces
3. **Dynamic Provisioning**: Databases are created on-demand upon approval
4. **Request Routing**: Requests are routed to the correct tenant database
5. **Scalability**: Architecture supports horizontal scaling
6. **Security**: Strong tenant isolation with no data leakage

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│  (Alpha, Agency, Cashier, Driver, Passenger Apps)               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Hono.js API Server                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           Tenant Resolution Middleware                      ││
│  │  - Extract tenant from subdomain (agency.viago.com)        ││
│  │  - Or from API key header (X-Tenant-ID)                    ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           Request Pipeline                                  ││
│  │  - Auth Middleware (Better Auth)                           ││
│  │  - Tenant Guard Middleware                                  ││
│  │  - Business Logic Handlers                                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│               Tenant Connection Manager                         │
│  - LRU cache for tenant database connections                    │
│  - Connection pooling per tenant                                 │
│  - Automatic reconnection on failure                             │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Master DB      │  │  Tenant DB #1   │  │  Tenant DB #N   │
│  (viago_master)  │  │  (viago_t1_*)  │  │  (viago_tN_*)  │
│                 │  │                │  │                │
│  - Tenants      │  │  - Buses       │  │  - Buses       │
│  - Users        │  │  - Trips       │  │  - Trips       │
│  - AgencyReqs   │  │  - Bookings    │  │  - Bookings    │
│  - SystemRoles  │  │  - ...         │  │  - ...         │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Database Schema Changes

### Master Database Models

The following models remain in the master database:

```prisma
// Master Database (viago_master)
model Tenant {
  id          String   @id @default(cuid())
  slug        String   @unique  // subdomain identifier
  name        String
  databaseName String  @unique // e.g., "viago_t1_abc123"
  status      TenantStatus @default(PROVISIONING)
  
  agencyRequestId String?  @unique
  agencyRequest   AgencyRequest?
  
  ownerId     String?
  owner       User?   @relation(fields: [ownerId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  provisionedAt DateTime?
  
  // Audit fields
  approvedBy  String?
  approvedAt  DateTime?
  suspendedAt DateTime?
  suspendedReason String?
  
  @@index([status])
  @@index([slug])
}

enum TenantStatus {
  PENDING
  PROVISIONING
  ACTIVE
  SUSPENDED
  DELETED
}
```

### Tenant Database Models

Each tenant database contains business data (no User/Tenant models):

```prisma
// Tenant Database (viago_t{slug})
model Bus { /* ... */ }
model Trip { /* ... */ }
model Booking { /* ... */ }
model Station { /* ... */ }
model Seat { /* ... */ }
model Ticket { /* ... */ }
model Transaction { /* ... */ }
model Report { /* ... */ }
model Feedback { /* ... */ }
model AgencyLocation { /* ... */ }
model AgencyMember { /* ... */ }
model Notification { /* ... */ }
```

---

## Component Specifications

### 1. Tenant Resolution Middleware

**File**: `apps/server/src/middlewares/tenant/resolve-tenant.ts`

**Responsibilities**:
- Extract tenant identifier from request
- Validate tenant exists and is active
- Inject tenant context into request

**Tenant Identification Strategies**:
1. **Subdomain**: `agency-slug.viago.com` → `X-Tenant-ID: agency-slug`
2. **Header**: `X-Tenant-ID: agency-slug`
3. **Path**: `/api/agency/{slug}/...`

**Flow**:
```typescript
1. Extract tenant slug from subdomain/header/path
2. Query master DB: `prisma.tenant.findUnique({ where: { slug } })`
3. Validate status === 'ACTIVE'
4. Set tenant context: `ctx.set('tenant', tenant)`
5. Continue to next middleware
```

### 2. Connection Manager

**File**: `packages/database/src/tenant/connection-manager.ts`

**Responsibilities**:
- Maintain connection pool per tenant
- LRU cache for tenant connections (max 50 tenants)
- Automatic cleanup of idle connections
- Reconnection on failure

**API**:
```typescript
interface TenantConnectionManager {
  getConnection(tenant: Tenant): Promise<PrismaClient>;
  releaseConnection(tenantId: string): Promise<void>;
  clearAll(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

### 3. Database Provisioning Service

**File**: `apps/server/src/services/tenant-provisioner.ts`

**Responsibilities**:
- Create tenant database from template
- Run migrations
- Seed initial data
- Register tenant in master DB

**Provisioning Flow**:
```typescript
async function provisionTenant(agencyRequestId: string, approverId: string) {
  // 1. Get agency request details
  const request = await masterPrisma.agencyRequest.findUnique({...});
  
  // 2. Generate unique database name
  const dbName = `viago_${slugify(request.agencyName)}_${shortId()}`;
  
  // 3. Create database via PostgreSQL
  await executeSQL(`CREATE DATABASE "${dbName}"`);
  
  // 4. Update master DB with tenant record
  const tenant = await masterPrisma.tenant.create({
    data: {
      slug: generateSlug(request.agencyName),
      name: request.agencyName,
      databaseName: dbName,
      status: 'PROVISIONING',
      agencyRequestId,
      approvedBy: approverId,
      approvedAt: new Date(),
    }
  });
  
  // 5. Create Prisma client for new DB
  const tenantPrisma = createTenantClient(dbName);
  
  // 6. Push schema to new database
  await tenantPrisma.$executeRaw`SELECT 1`; // Force connection
  await runMigrations(tenantPrisma);
  
  // 7. Seed initial data (default roles, etc.)
  await seedTenantDatabase(tenantPrisma);
  
  // 8. Mark tenant as active
  await masterPrisma.tenant.update({
    where: { id: tenant.id },
    data: { status: 'ACTIVE', provisionedAt: new Date() }
  });
  
  // 9. Create agency record in master DB
  await createAgencyFromRequest(masterPrisma, request, tenant);
  
  return tenant;
}
```

### 4. Tenant Context Helpers

**File**: `apps/server/src/lib/hono/tenant-context.ts`

**API**:
```typescript
// Get current tenant from context
const tenant = getContextTenant();

// Get tenant-scoped database client
const db = getTenantDb(tenant);

// Execute tenant-scoped query
const buses = await withTenantScope(tenant, (db) => 
  db.bus.findMany({ where: { status: 'ACTIVE' } })
);
```

### 5. Query Scoping Utility

**File**: `packages/database/src/tenant/query-scope.ts`

**Purpose**: Automatically add tenant filter to all queries

**Implementation**: Wrapper that intercepts Prisma queries and injects tenant context.

---

## Request Flow

### Authenticated Agency Request

```
1. Client Request
   GET /api/agency/trips
   Host: agency-slug.viago.com
   Cookie: better-auth.session=...

2. Tenant Resolution Middleware
   - Extract slug from subdomain: "agency-slug"
   - Query master DB for tenant
   - Validate tenant.status === 'ACTIVE'
   - Set ctx.var.tenant

3. Auth Middleware
   - Validate session with Better Auth
   - Set ctx.var.user, ctx.var.session

4. Agency Guard Middleware
   - Verify user has agency membership
   - Verify user's agency matches tenant
   - Set ctx.var.agency

5. Business Handler
   - Access ctx.var.tenant to get tenant info
   - Use getTenantDb(tenant) for tenant-scoped queries
   - All queries automatically scoped to tenant

6. Response
   200 OK with tenant-specific data
```

---

## Security Considerations

### Data Isolation

1. **Connection Isolation**: Each tenant gets a dedicated Prisma client
2. **No Cross-Tenant Queries**: Connection manager validates tenant context before each request
3. **Query Validation**: Tenant ID must match authenticated user's agency

### Database Security

1. **Encryption at Rest**: Enable PostgreSQL encryption
2. **SSL Connections**: All tenant connections use SSL
3. **Connection Limits**: Per-tenant connection limits to prevent resource exhaustion

### API Security

1. **Tenant Header Validation**: Reject requests with mismatched tenant/agency
2. **Rate Limiting**: Per-tenant rate limits
3. **Audit Logging**: Log all cross-tenant admin actions

---

## Scalability Strategy

### Connection Pooling

```
┌─────────────────────────────────────────────────────────┐
│                  PgBouncer Layer                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Pool 1  │ │ Pool 2  │ │ Pool 3  │ │ Pool N  │       │
│  │Master DB│ │Tenant 1 │ │Tenant 2 │ │Tenant N │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Horizontal Scaling

1. **Read Replicas**: For large tenants, add read replicas
2. **Connection Pooling**: Use PgBouncer in transaction mode
3. **Tenant Partitioning**: Group small tenants on shared infrastructure

---

## Migration Strategy

### Phase 1: Add Tenant Model (No Breaking Changes)

1. Add `Tenant` model to master database
2. Add `tenantId` field to `Agency` model
3. Keep existing single-database architecture

### Phase 2: Provisioning Service

1. Implement `TenantProvisioningService`
2. Add `/admin/tenants` endpoints
3. Test provisioning flow

### Phase 3: Connection Manager

1. Implement `TenantConnectionManager`
2. Add tenant middleware
3. Add context helpers

### Phase 4: Query Scoping

1. Implement `withTenantScope` utility
2. Migrate existing queries to use scoped client
3. Add automated tests

### Phase 5: Deprecation of Legacy Model

1. Mark `Agency.tenantId` as required
2. Migrate all data to tenant databases
3. Remove single-database fallback

---

## File Structure

```
apps/server/src/
├── middlewares/
│   └── tenant/
│       ├── resolve-tenant.ts      # Tenant resolution middleware
│       └── index.ts
├── services/
│   └── tenant-provisioner.ts      # Database provisioning service
├── lib/
│   └── tenant/
│       ├── context.ts            # Tenant context helpers
│       ├── guards.ts             # Tenant guards
│       └── index.ts
└── env.ts                        # Add TENANT_* env vars

packages/database/src/
├── tenant/
│   ├── connection-manager.ts     # Tenant connection pool
│   ├── query-scope.ts            # Query scoping utilities
│   └── index.ts
└── client.ts                     # Add createTenantClient()
```

---

## Environment Variables

```env
# Master database
POSTGRES_URL=postgresql://user:pass@host:5432/viago_master

# Tenant database prefix pattern
TENANT_DB_PREFIX=viago_
TENANT_DB_HOST=localhost
TENANT_DB_PORT=5432
TENANT_DB_USER=viago
TENANT_DB_PASSWORD=***

# Connection pool settings
TENANT_POOL_MAX_SIZE=10
TENANT_POOL_IDLE_TIMEOUT=30000
TENANT_CACHE_MAX_SIZE=50
```

---

## Error Handling

### Tenant-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `tenant:not_found` | 404 | Tenant does not exist |
| `tenant:suspended` | 403 | Tenant is suspended |
| `tenant:provisioning` | 503 | Tenant database being created |
| `tenant:connection_failed` | 500 | Cannot connect to tenant DB |
| `tenant:mismatch` | 403 | Requested tenant != authenticated tenant |

---

## Testing Strategy

### Unit Tests

1. Tenant resolution middleware
2. Connection manager
3. Provisioning service

### Integration Tests

1. Full provisioning flow
2. Cross-tenant isolation verification
3. Connection pooling behavior

### E2E Tests

1. Agency approval → database creation → data access
2. Tenant suspension → access denial
3. Connection recovery

---

## Appendix: Prisma Schema Changes

See `packages/database/prisma/schema.prisma` for complete updated schema with:
- `Tenant` model in master database
- `Agency` references to `Tenant`
- Tenant-scoped models (simplified, no User/Tenant)
