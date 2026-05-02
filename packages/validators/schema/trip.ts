import { BusSeatPolicy, TripStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const listTripsSchema = baseQuerySchema.extend({
  name: z.string().optional(),
  agencyId: z.string().optional(),
  arrivalTime: z.iso.datetime().optional(),
  departureTime: z.iso.datetime().optional(),
  fromStation: z.string().optional(),
  seatReservationType: z.enum(BusSeatPolicy).optional(),
  sortBy: z.enum(['departureTime', 'arrivalTime']).optional().default('departureTime'),
  status: z.enum(TripStatus).optional(),
  toStation: z.string().optional(),
});

export const stationSchema = z.object({
  departureTime: z.iso.datetime(),
  name: z.string().min(2),
  order: z.number().gte(0),
  startingPrice: z.number().gt(0),
  cityId: z.cuid(),
});

export const createTripSchema = z.object({
  arrivalTime: z.iso.datetime(),
  busId: z.cuid(),
  departureTime: z.iso.datetime(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
  driverId: z.cuid(),
  name: z.string().min(1, 'Trip name is required').max(255, 'Trip name must be less than 255 characters').trim(),
  stations: z.array(stationSchema),
});

export const createTripAdminSchema = z.object({
  agencyId: z.cuid(),
  departureCityId: z.cuid(),
  arrivalCityId: z.cuid(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
});

export const updateTripSchema = z.object({
  arrivalTime: z.iso.datetime(),
  busId: z.string(),
  departureTime: z.iso.datetime(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable(),
  driverId: z.string(),
  name: z.string().min(1, 'Trip name is required').max(255, 'Trip name must be less than 255 characters').trim(),
  stations: z.array(stationSchema),
  status: z.string(),
});

export const tripIdSchema = z.object({
  id: z.cuid('Invalid trip ID format'),
});

export const tripStationsSchema = baseQuerySchema.extend({
  fromStationId: z.cuid('Invalid start station id'),
  toStationId: z.cuid('Invalid end station id'),
});
export const tripsRoutesSchema = baseQuerySchema.extend({
  fromStation: z.string('Invalid start station id').optional(),
  startDate: z.iso.datetime().optional(),
  toStation: z.string('Invalid end station id').optional(),
});

export const tripSeatsQuerySchema = z.object({
  fromStationId: z.cuid('Invalid start station id'),
  toStationId: z.cuid('Invalid end station id'),
});

export const updateTripStatusSchema = z.object({
  status: z.enum(TripStatus),
});
