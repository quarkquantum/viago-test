import { BookingStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const createBookingSchema = z.object({
  fromStationId: z.cuid('Invalid from station ID format'),
  seatId: z.cuid('Invalid Seat Id').optional(),
  toStationId: z.cuid('Invalid to station ID format'),
  tripId: z.cuid('Invalid trip ID format'),
});

export const listBookingsSchema = baseQuerySchema.extend({
  status: z.enum(BookingStatus).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(BookingStatus).optional(),
});
