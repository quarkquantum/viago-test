import { ReportType } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const createReportSchema = z.object({
  content: z.string().max(1000).optional(),
  tripId: z.string().cuid('Invalid trip ID format'),
  type: z.enum(ReportType),
});

const DriverReportTypes = [ReportType.BREAKDOWN, ReportType.DELAY, ReportType.SAFETY, ReportType.OTHER] as const;

export const createDriverReportSchema = z.object({
  content: z.string().max(1000).optional(),
  tripId: z.string().cuid('Invalid trip ID format'),
  type: z.enum(DriverReportTypes),
});

export const listDriverReportsSchema = baseQuerySchema.extend({
  tripId: z.string().cuid('Invalid trip ID format').optional(),
});
