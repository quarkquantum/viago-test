import { Colors } from '@repo/shared';
import { StationStatus } from '@repo/shared/constants';

export const getStationStatusColor = (status: StationStatus) => {
  switch (status) {
    case StationStatus.COMPLETED:
      return Colors.SUCCESS;
    case StationStatus.ACTIVE:
    case StationStatus.BOARDING:
      return Colors.SECONDARY;
    default:
      return `${Colors.PRIMARY}40`;
  }
};

export const getStationStatusBadgeColor = (status: StationStatus) => {
  switch (status) {
    case StationStatus.COMPLETED:
      return Colors.SUCCESS;
    case StationStatus.ACTIVE:
    case StationStatus.BOARDING:
      return Colors.SECONDARY;
    default:
      return Colors.SECONDARY;
  }
};

export const isStationBlocked = (stations: any[], currentIndex: number) => {
  const previousStations = stations.slice(0, currentIndex);
  return previousStations.some((ps: any) => ps.status !== StationStatus.COMPLETED);
};
