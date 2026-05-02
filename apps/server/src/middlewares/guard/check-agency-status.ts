import { AgencyStatus } from '@repo/shared/constants';
import { AppError } from '@/errors/index';

export const checkAgencyStatus = (agency: { status: string; name: string }) => {
  if (agency.status !== AgencyStatus.ACTIVE) {
    throw new AppError({
      cause: `Agency "${agency.name}" is ${agency.status.toLowerCase()}`,
      code: 'auth:agency_inactive',
      message: 'This agency is currently inactive or suspended. Access denied.',
    });
  }
};
