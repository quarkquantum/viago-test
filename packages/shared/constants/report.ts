export const ReportType = {
  BREAKDOWN: 'BREAKDOWN',
  SPEEDING: 'SPEEDING',
  DELAY: 'DELAY',
  SAFETY: 'SAFETY',
  COMFORT: 'COMFORT',
  OTHER: 'OTHER',
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportStatus = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  RESOLVED: 'RESOLVED',
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
