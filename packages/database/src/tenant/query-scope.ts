import type { PrismaClient } from '@prisma/client';

export interface AgencyScopeOptions {
  agencyId: string;
}

export function withAgencyScope<T>(
  db: PrismaClient,
  options: AgencyScopeOptions,
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const scopedDb = createScopedClient(db, options);
  return fn(scopedDb);
}

function createScopedClient(_db: PrismaClient, options: AgencyScopeOptions): PrismaClient {
  return _db.$extends({
    client: {
      _agencyContext: options,
    },
  }) as PrismaClient & { _agencyContext: AgencyScopeOptions };
}

export function getAgencyScope(prisma: PrismaClient): AgencyScopeOptions | undefined {
  return (prisma as unknown as { _agencyContext?: AgencyScopeOptions })._agencyContext;
}

export function addAgencyWhere<T extends object>(
  model: T,
  agencyId: string
): T & { where: { agencyId: string } } {
  return model as T & { where: { agencyId: string } };
}

export function createAgencyFilter(agencyId: string) {
  return { agencyId };
}
