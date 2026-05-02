import { prisma } from '@repo/database';
import { getContextAgency } from './context';

export function getAgencyDb() {
  const agency = getContextAgency();
  return {
    db: prisma,
    agencyId: agency.id,
  };
}
