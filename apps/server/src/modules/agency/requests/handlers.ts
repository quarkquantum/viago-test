import { prisma } from '@repo/database';
import { AgencyRequestStatus } from '@repo/shared/constants';
import { Hono } from 'hono';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { AgencyRequestRoutes } from './routes';

const requestHandler = new Hono<HonoEnv>().post('/', ...AgencyRequestRoutes.createRequest, async (ctx) => {
  const t = await useTranslation(ctx);
  const data = await ctx.req.json();

  // Check for duplicate pending request by email
  const existingRequest = await prisma.agencyRequest.findFirst({
    where: {
      email: data.email,
      status: AgencyRequestStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new AppError({
      code: 'database:query_error',
      message: t('agencyRequest.api.error.duplicate_pending'),
    });
  }

  const agencyRequest = await prisma.agencyRequest.create({
    data: {
      ...(data.agencyName && { agencyName: data.agencyName }),
      ...(data.legalForm && { legalForm: data.legalForm }),
      ...(data.description && { description: data.description }),
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      ...(data.countryCode && { countryCode: data.countryCode }),
      status: AgencyRequestStatus.PENDING,
      ...(data.cityId && { cityId: data.cityId }),
      ...(data.city && { city: data.city }),
      ...(data.address && { address: data.address }),
      ...(data.officialPhone && { officialPhone: data.officialPhone }),
      ...(data.officialEmail && { officialEmail: data.officialEmail }),
      ...(data.position === 'AUTRE' && data.customPosition
        ? { position: data.customPosition }
        : data.position && { position: data.position }),
      ...(data.directPhone && { directPhone: data.directPhone }),
      ...(data.directEmail && { directEmail: data.directEmail }),
      ...(data.numberOfAgencies && { numberOfAgencies: data.numberOfAgencies }),
      ...(data.citiesServed && { citiesServed: JSON.stringify(data.citiesServed) }),
      ...(data.numberOfBuses && { numberOfBuses: data.numberOfBuses }),
      ...(data.busType && { busType: data.busType }),
      ...(data.logo && { logo: data.logo }),
      ...(data.rccmDocument && { rccmDocument: data.rccmDocument }),
      ...(data.taxCardDocument && { taxCardDocument: data.taxCardDocument }),
      ...(data.password && { password: data.password }),
    },
  });

  return ctx.json(
    {
      data: agencyRequest,
      message: t('agencyRequest.api.success.created'),
    },
    201
  );
});

export default requestHandler;
