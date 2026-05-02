export const Env = {
  Development: 'development',
  Production: 'production',
  Test: 'test',
  Staging: 'staging',
} as const;

export type Env = (typeof Env)[keyof typeof Env];

export const QueueNames = {
  NOTIFICATIONS: 'notifications',
} as const;
export type QueueNames = (typeof QueueNames)[keyof typeof QueueNames];
export const CronQueueNames = {
  DEFAULT: 'default',
} as const;
export type CronQueueNames = (typeof CronQueueNames)[keyof typeof CronQueueNames];
