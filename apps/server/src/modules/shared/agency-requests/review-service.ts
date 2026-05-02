import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { SystemRoles, TRIAL_DURATION_MONTHS } from '@repo/shared';
import { AgencyRequestStatus, AgencyStatus, SubscriptionStatus } from '@repo/shared/constants';
import { nanoid } from 'nanoid';
import { AppError } from '@/errors';

type TranslationFn = (key: string) => string;

type AuthApiAdapter = {
  createUser: (args: {
    body: {
      email: string;
      name: string;
      password: string;
    };
    headers: Headers | Record<string, string | undefined>;
  }) => Promise<unknown>;
  requestPasswordReset: (args: {
    body: {
      email: string;
      redirectTo: string;
    };
    headers: Headers | Record<string, string | undefined>;
  }) => Promise<unknown>;
  removeUser?: (args: {
    body: {
      userId: string;
    };
    headers: Headers | Record<string, string | undefined>;
  }) => Promise<unknown>;
};

type ReviewContext = {
  authApi: AuthApiAdapter;
  headers: Headers | Record<string, string | undefined>;
  identifier: string;
  approverId?: string;
  t: TranslationFn;
};

const getAgencyRequestOrThrow = async ({ identifier, t }: Pick<ReviewContext, 'identifier' | 't'>) => {
  const agencyRequest = await prisma.agencyRequest.findUnique({
    where: { id: identifier },
  });

  if (!agencyRequest) {
    throw new AppError({
      code: 'database:not_found',
      entityType: 'agencyRequest',
      message: t('agencyRequest.api.error.not_found'),
    });
  }

  if (agencyRequest.status !== AgencyRequestStatus.PENDING) {
    throw new AppError({
      code: 'database:query_error',
      message: t('agencyRequest.api.error.not_pending'),
    });
  }

  return agencyRequest;
};

export const rejectAgencyRequest = async ({
  identifier,
  rejectionReason,
  t,
}: {
  identifier: string;
  rejectionReason?: string;
  t: TranslationFn;
}) => {
  await getAgencyRequestOrThrow({ identifier, t });

  return prisma.agencyRequest.update({
    data: {
      rejectionReason,
      reviewedAt: new Date(),
      status: AgencyRequestStatus.REJECTED,
    },
    where: { id: identifier },
  });
};

export const acceptAgencyRequest = async ({
  authApi,
  headers,
  identifier,
  approverId,
  origin,
  t,
}: ReviewContext & { origin?: string }) => {
  console.log('[REVIEW] acceptAgencyRequest start', { identifier, approverId });
  const agencyRequest = await getAgencyRequestOrThrow({ identifier, t });
  console.log('[REVIEW] Found agency request', { id: agencyRequest.id, status: agencyRequest.status });
  const password = nanoid(12);

  const firstName = agencyRequest.firstName || 'Owner';
  const lastName = agencyRequest.lastName || 'Agency';
  const agencyName = agencyRequest.agencyName || 'New Agency';
  const accountEmail = agencyRequest.accountEmail || agencyRequest.email || `owner-${identifier}@example.com`;
  console.log('[REVIEW] About to create user', { accountEmail, name: `${firstName} ${lastName}` });

  let response: unknown;
  try {
    response = await authApi.createUser({
      body: {
        email: accountEmail,
        name: `${firstName} ${lastName}`,
        password,
      },
      headers,
    });
    console.log('[REVIEW] createUser response', { response });
  } catch (err) {
    console.log('[REVIEW] createUser error', { error: err?.message, stack: err?.stack });
    throw new AppError({
      code: 'database:query_error',
      cause: err,
      message: t('agency.api.error.create_owner_failed'),
    });
  }

  if (!response || (typeof response === 'object' && 'error' in response)) {
    throw new AppError({
      code: 'database:query_error',
      message: t('agency.api.error.create_owner_failed'),
    });
  }

  const user = (response as { user?: { id: string }; id?: string }).user || (response as { id?: string });

  if (!user?.id) {
    throw new AppError({
      code: 'database:query_error',
      message: t('agency.api.error.create_owner_failed'),
    });
  }

  try {
    const createdAgency = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        data: {
          emailVerified: true,
          role: SystemRoles.AGENCY,
          profile: {
            upsert: {
              create: {
                firstName,
                lastName,
                phoneNumber: agencyRequest.phoneNumber || '',
              },
              update: {
                firstName,
                lastName,
                phoneNumber: agencyRequest.phoneNumber || '',
              },
            },
          },
        },
        where: { id: user.id },
      });

      const agency = await tx.agency.create({
        data: {
          description: agencyRequest.description,
          name: agencyName,
          ownerId: user.id,
          slug: agencyName.toLowerCase().replace(/\s+/g, '-'),
          status: AgencyStatus.ACTIVE,
          countryCode: agencyRequest.countryCode || 'CM',
          email: agencyRequest.officialEmail,
        },
      });

      // Validate city exists, create default city if needed
      let cityId = agencyRequest.cityId;
      const cityExists = cityId ? await tx.city.findUnique({ where: { id: cityId } }) : null;
      
      if (!cityExists) {
        let defaultCity = await tx.city.findFirst();
        
        if (!defaultCity) {
          // Create a default city if none exists
          defaultCity = await tx.city.create({
            data: {
              id: 'city_default',
              name: 'Default City',
              countryCode: agencyRequest.countryCode || 'CM',
              latitude: 0,
              longitude: 0,
            },
          });
        }
        
        cityId = defaultCity.id;
      }

      const location = await tx.agencyLocation.create({
        data: {
          address: agencyRequest.address,
          agencyId: agency.id,
          cityId: cityId || '',
          email: agencyRequest.officialEmail,
          name: agencyName,
          phone: agencyRequest.officialPhone,
        },
      });

      let ownerRole = await tx.agencyRole.findUnique({ where: { name: 'OWNER' } });
      if (!ownerRole) {
        ownerRole = await tx.agencyRole.create({
          data: { name: 'OWNER', description: 'Agency Owner' },
        });
      }

      await tx.agencyMember.create({
        data: {
          agency: { connect: { id: agency.id } },
          location: { connect: { id: location.id } },
          role: { connect: { id: ownerRole.id } },
          user: { connect: { id: user.id } },
          status: 'ACTIVE',
        },
      });

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + TRIAL_DURATION_MONTHS);

      await tx.agencySubscription.create({
        data: {
          agencyId: agency.id,
          status: SubscriptionStatus.TRIAL,
          trialEndDate,
          trialStartDate,
        },
      });

      await tx.agencyRequest.update({
        data: {
          reviewedAt: new Date(),
          status: AgencyRequestStatus.APPROVED,
        },
        where: { id: identifier },
      });

      return agency;
    });

    if (origin) {
      await authApi.requestPasswordReset({
        body: {
          email: agencyRequest.email,
          redirectTo: `${origin}/reset-password`,
        },
        headers,
      });
    }

    return createdAgency;
  } catch (error: any) {
    logger.error('Agency acceptance failed', {
      agencyRequestId: identifier,
      userId: user.id,
      error,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorCause: error?.cause,
    });

    if (authApi.removeUser) {
      await authApi.removeUser({
        body: { userId: user.id },
        headers,
      });
    }

    throw error;
  }
};
