export const SystemRoles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  AGENCY: 'AGENCY',
  AGENCY_MANAGER: 'AGENCY_MANAGER',
  CASHIER: 'CASHIER',
  DRIVER: 'DRIVER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPPORT: 'SUPPORT',
  USER: 'USER',
} as const;
export type SystemRoles = (typeof SystemRoles)[keyof typeof SystemRoles];
