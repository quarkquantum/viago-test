import { prisma } from '@repo/database';
import { BookingStatus, SeatType } from '@repo/shared/constants';

export const ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES = [
  BookingStatus.CONFIRMED,
  BookingStatus.PENDING,
  BookingStatus.COMPLETED,
];

type SegmentSeat = {
  id: string;
  type: string;
};

type SegmentBooking = {
  seatId: string;
  fromStation: { order: number };
  toStation: { order: number };
};

const isSegmentOverlap = (segmentStart: number, segmentEnd: number, bookingStart: number, bookingEnd: number) =>
  bookingStart < segmentEnd && segmentStart < bookingEnd;

export const getSegmentSeatOccupancy = ({
  bookings,
  fromOrder,
  seats,
  toOrder,
}: {
  seats: SegmentSeat[];
  bookings: SegmentBooking[];
  fromOrder: number;
  toOrder: number;
}) => {
  const passengerSeatIds = new Set(seats.filter((seat) => seat.type === SeatType.PASSENGER).map((seat) => seat.id));
  const occupiedPassengerSeatIds = new Set<string>();

  for (const booking of bookings) {
    if (!passengerSeatIds.has(booking.seatId)) {
      continue;
    }

    if (isSegmentOverlap(fromOrder, toOrder, booking.fromStation.order, booking.toStation.order)) {
      occupiedPassengerSeatIds.add(booking.seatId);
    }
  }

  const total = passengerSeatIds.size;
  const reserved = occupiedPassengerSeatIds.size;
  const available = Math.max(0, total - reserved);

  return {
    available,
    occupiedPassengerSeatIds,
    reserved,
    total,
  };
};

export const SeatAvailabilityService = {
  /**
   * Finds all available seats for a given trip and segment (fromStation -> toStation).
   * dynamic availability is calculated by checking for overlapping bookings.
   */
  async getAvailableSeats(tripId: string, fromOrder: number, toOrder: number) {
    // 1. Fetch trip, bus, seats, and their active bookings
    const trip = await prisma.trip.findUnique({
      include: {
        bookings: {
          select: {
            fromStation: { select: { order: true } },
            seatId: true,
            toStation: { select: { order: true } },
          },
          where: {
            // Only consider bookings that block a seat
            status: {
              in: ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES,
            },
          },
        },
        bus: {
          include: {
            seats: {
              where: {
                // Business rule: only consider seats that are for passengers
                // We ignore 'status' column as requested, assuming all exist seats are working
                // Or status is no longer the source of truth.
                type: SeatType.PASSENGER,
              },
            },
          },
        },
      },
      where: { id: tripId },
    });

    if (!trip?.bus) {
      return [];
    }

    const { bookings } = trip;
    const { seats } = trip.bus;
    const occupancy = getSegmentSeatOccupancy({ bookings, fromOrder, seats, toOrder });
    const availableSeats = seats.filter((seat) => !occupancy.occupiedPassengerSeatIds.has(seat.id));

    return availableSeats;
  },

  /**
   * Checks if a specific seat is available for a given trip and segment.
   */
  async isSeatAvailable(tripId: string, seatId: string, fromOrder: number, toOrder: number): Promise<boolean> {
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        tripId,
        seatId,
        status: {
          in: ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES,
        },
        fromStation: { order: { lt: toOrder } },
        toStation: { order: { gt: fromOrder } },
      },
    });

    return !overlappingBooking;
  },

  /**
   * Returns the count of available seats for a given trip and segment.
   */
  async getAvailableSeatCount(tripId: string, fromOrder: number, toOrder: number): Promise<number> {
    const availableSeats = await this.getAvailableSeats(tripId, fromOrder, toOrder);
    return availableSeats.length;
  },
};
