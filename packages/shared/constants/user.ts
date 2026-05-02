export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserType = {
  DRIVER: 'DRIVER',
  PASSENGER: 'PASSENGER',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
