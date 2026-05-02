import { SystemRoles } from '@repo/shared';
import { Seeder } from '../core';

interface RoleItem {
  name: string;
}

const ROLES: RoleItem[] = [
  { name: SystemRoles.OWNER },
  { name: SystemRoles.DRIVER },
  { name: SystemRoles.CASHIER },
  { name: SystemRoles.AGENCY_MANAGER },
];

export function createRolesSeeder() {
  const seeder = new Seeder<RoleItem>({
    name: 'Agency Roles',
    data: ROLES,
    batchSize: 10,
    progressInterval: 10,
    processor: async (item, _index, prisma) => {
      await prisma.agencyRole.upsert({
        where: { name: item.name },
        update: {},
        create: { name: item.name },
      });
    },
  });
  return () => seeder.run();
}
