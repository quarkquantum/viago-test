import type { StationStatus } from '@repo/shared/constants';
import { notifyStationUpdate, notifyTripStart } from '@/utils/notifications';
import type { Trip } from '../api/use-get-trip';
import { useStartTrip } from '../api/use-start-trip';
import { useUpdateStationStatus } from '../api/use-update-station-status';

export const useTripState = (trip?: Trip) => {
  const startTrip = useStartTrip();
  const updateStationStatus = useUpdateStationStatus(trip?.id as string);

  const { stations = [] } = trip || {};

  const handleStartTrip = async () => {
    if (!trip?.id) {
      return;
    }
    await startTrip.mutateAsync({
      identifier: trip.id,
    });
    await notifyTripStart();
  };

  const handleUpdateStation = async (stationId: string, nextStatus: StationStatus) => {
    await updateStationStatus.mutateAsync({
      stationId,
      status: nextStatus,
    });
    const station = stations.find((s) => s.id === stationId);
    await notifyStationUpdate(nextStatus, station?.name);
  };

  return {
    stations,
    handleStartTrip,
    handleUpdateStation,
    tripStatusLoading: startTrip.isPending,
    stationStatusLoading: updateStationStatus.isPending,
  };
};
