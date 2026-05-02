import { StationStatus, TripStatus } from '@repo/shared';
import { z } from 'zod';

export const TripScreenStateSchema = z.discriminatedUnion('screen', [
  z.object({
    screen: z.literal('waiting'),
    countdown: z.number(),
    message: z.string(),
  }),
  z.object({
    screen: z.literal('boarding'),
    message: z.string(),
    canStartTrip: z.boolean(),
  }),
  z.object({
    screen: z.literal('ongoing'),
    canCompleteTrip: z.boolean(),
  }),
  z.object({
    screen: z.literal('completed'),
    message: z.string(),
  }),
  z.object({
    screen: z.literal('cancelled'),
    message: z.string(),
  }),
  z.object({
    screen: z.literal('deleted'),
    message: z.string(),
  }),
]);

export type TripScreenState = z.infer<typeof TripScreenStateSchema>;

export type StationActions = {
  canMarkAsBoarding: boolean;
  canMarkAsActive: boolean;
  canMarkAsCompleted: boolean;
  canScanTickets: boolean;
  isCurrentStation: boolean;
  showStationDetails: boolean;
  completionDisabled?: boolean;
  isCompleted?: boolean;
  completionUnlockTime?: Date;
  canStartTrip?: boolean;
};

function getTimeUntil(targetTime: Date): number {
  const now = new Date();
  return targetTime.getTime() - now.getTime();
}

function isWithinBoardingWindow(departureTime: Date): boolean {
  const now = new Date();
  const fifteenMinutesBeforeDeparture = new Date(departureTime.getTime() - 15 * 60 * 1000);
  return now >= fifteenMinutesBeforeDeparture;
}

function isTimePassed(time: Date): boolean {
  return new Date() >= new Date(time);
}

function findCurrentStationIndex(stations: Array<{ status: string }>): number {
  const boardingIndex = stations.findIndex((s) => s.status === StationStatus.BOARDING);
  if (boardingIndex !== -1) {
    return boardingIndex;
  }

  const activeIndex = stations.findIndex((s) => s.status === StationStatus.ACTIVE);
  if (activeIndex !== -1) {
    return activeIndex;
  }

  return -1;
}

export function getTripDuration(trip: { departureTime: Date; arrivalTime: Date }): number {
  const durationInMs = (trip.arrivalTime?.getTime() || 0) - (trip.departureTime?.getTime() || 0);
  return durationInMs;
}
export function getTripActions(trip: {
  status: string;
  departureTime: Date;
  stations: Array<{ status: string; departureTime: Date }>;
}): TripScreenState {
  const { status, departureTime, stations } = trip;

  // DELETED TRIP
  if (status === TripStatus.DELETED) {
    return {
      screen: 'deleted',
      message: 'trip.screen.deleted',
    };
  }

  // CANCELLED TRIP
  if (status === TripStatus.CANCELLED) {
    return {
      screen: 'cancelled',
      message: 'trip.screen.cancelled',
    };
  }

  // COMPLETED TRIP
  if (status === TripStatus.COMPLETED) {
    return {
      screen: 'completed',
      message: 'trip.screen.completed',
    };
  }

  // ONGOING TRIP
  if (status === TripStatus.ONGOING) {
    const allStationsCompleted = stations.every((s) => s.status === StationStatus.COMPLETED);

    return {
      screen: 'ongoing',
      canCompleteTrip: allStationsCompleted,
    };
  }

  // ACTIVE TRIP - Check timing
  const boardingTime = new Date(departureTime.getTime() - 15 * 60 * 1000);
  const inBoardingWindow = isWithinBoardingWindow(departureTime);
  const isPastDeparture = isTimePassed(departureTime);

  // More than 30 minutes before departure - WAITING SCREEN
  if (!inBoardingWindow) {
    const countdown = getTimeUntil(boardingTime);

    return {
      screen: 'waiting',
      countdown,
      message: 'trip.screen.waiting',
    };
  }

  // Within 30 minutes of departure - BOARDING SCREEN
  const hasActiveStation = stations.some((s) => s.status === StationStatus.ACTIVE);
  const canStartTrip = isPastDeparture && hasActiveStation;

  return {
    screen: 'boarding',
    message: isPastDeparture ? 'trip.screen.can_start' : 'trip.screen.boarding',
    canStartTrip,
  };
}

export function getStationActions(
  station: {
    status: string;
    departureTime: Date;
    order: number;
    id?: string;
  },
  allStations: Array<{
    status: string;
    departureTime: Date;
    order: number;
  }>,
  currentIndex: number,
  isTripOngoing: boolean
): StationActions {
  const { status } = station;

  const currentStationIndex = findCurrentStationIndex(allStations);
  const isCurrentStation = currentStationIndex === currentIndex;

  // Rule 1: if pending, no buttons
  if (status === StationStatus.PENDING) {
    return {
      canMarkAsBoarding: true, // Hides "Arrive Station"
      canMarkAsActive: false,
      canMarkAsCompleted: false,
      canScanTickets: false,
      isCurrentStation: false,
      showStationDetails: true,
      canStartTrip: false,
    };
  }

  // Rule 4: if completed, disabled button says 'completed'
  if (status === StationStatus.COMPLETED) {
    return {
      canMarkAsBoarding: true,
      canMarkAsActive: false,
      canMarkAsCompleted: false,
      canScanTickets: false,
      isCurrentStation: false,
      showStationDetails: true,
      isCompleted: true,
      completionDisabled: true,
      canStartTrip: false,
    };
  }

  // Rule 2: if boarding, show buttons 'scan' and 'start'
  // pressing start marks the station as ACTIVE
  if (status === StationStatus.BOARDING && isCurrentStation) {
    return {
      canMarkAsBoarding: true,
      canMarkAsActive: false,
      canMarkAsCompleted: false,
      canScanTickets: true,
      isCurrentStation,
      showStationDetails: true,
      canStartTrip: true,
    };
  }

  // Rule 3: if active, show button complete
  // disabled if departureTime of next station is > 15 minutes
  if (status === StationStatus.ACTIVE && isCurrentStation) {
    const nextStation = allStations[currentIndex + 1];
    let completionDisabled = false;
    let completionUnlockTime: Date | undefined;

    if (nextStation) {
      const timeUntilNextDeparture = nextStation.departureTime.getTime() - Date.now();
      // if (timeUntilNextDeparture > 15 * 60 * 1000) {
      completionDisabled = true;
      completionUnlockTime = new Date(nextStation.departureTime.getTime() - 15 * 60 * 1000);
      // }
    }

    return {
      canMarkAsBoarding: true,
      canMarkAsActive: false,
      canMarkAsCompleted: true,
      canScanTickets: false,
      isCurrentStation,
      showStationDetails: true,
      completionDisabled,
      completionUnlockTime,
      canStartTrip: false,
    };
  }

  // Fallback
  return {
    canMarkAsBoarding: true,
    canMarkAsActive: false,
    canMarkAsCompleted: false,
    canScanTickets: false,
    isCurrentStation,
    showStationDetails: true,
    canStartTrip: false,
  };
}
