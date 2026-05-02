export const AgencyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type AgencyStatus = (typeof AgencyStatus)[keyof typeof AgencyStatus];

export const AgencyMemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type AgencyMemberStatus = (typeof AgencyMemberStatus)[keyof typeof AgencyMemberStatus];

export const AgencyRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type AgencyRequestStatus = (typeof AgencyRequestStatus)[keyof typeof AgencyRequestStatus];
