import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export interface UpdateAgencyStatusParams {
  agencyId: string;
  status: string;
  reason?: string;
}

export class AgencyManagementService {
  async suspendAgency(agencyId: string, reason: string): Promise<void> {
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new Error(`Agency ${agencyId} not found`);
    }

    if (agency.status !== 'ACTIVE') {
      throw new Error(`Agency ${agencyId} is not active`);
    }

    await prisma.agency.update({
      where: { id: agencyId },
      data: {
        status: 'SUSPENDED',
      },
    });

    logger.info('Agency suspended', { agencyId, reason });
  }

  async reactivateAgency(agencyId: string): Promise<void> {
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new Error(`Agency ${agencyId} not found`);
    }

    if (agency.status !== 'SUSPENDED') {
      throw new Error(`Agency ${agencyId} is not suspended`);
    }

    await prisma.agency.update({
      where: { id: agencyId },
      data: {
        status: 'ACTIVE',
      },
    });

    logger.info('Agency reactivated', { agencyId });
  }

  async deleteAgency(agencyId: string): Promise<void> {
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new Error(`Agency ${agencyId} not found`);
    }

    await prisma.agency.update({
      where: { id: agencyId },
      data: { status: 'DELETED' },
    });

    logger.info('Agency deleted (soft delete)', { agencyId });
  }
}

export const agencyManagementService = new AgencyManagementService();
