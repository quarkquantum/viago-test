export const AgencyManagerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type AgencyManagerStatus = (typeof AgencyManagerStatus)[keyof typeof AgencyManagerStatus];
