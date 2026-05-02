import type { StationStatus } from '@repo/shared/constants';
import { ApiError } from '@repo/shared';
import { onlineManager, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { client } from '@/lib/hono';
import { enqueue } from '@/lib/offline-queue';

export const useUpdateStationStatus = (tripId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    networkMode: 'offlineFirst',
    mutationFn: async ({ stationId, status }: { stationId: string; status: StationStatus }) => {
      if (!onlineManager.isOnline()) {
        enqueue({
          type: 'UPDATE_STATION_STATUS',
          payload: { identifier: tripId, stationId, status },
        });
        return {} as Record<string, unknown>;
      }

      const res = await client.api.driver.trips[':identifier'].station[':stationId'].status.$patch({
        param: { stationId, identifier: tripId },
        json: { status },
      });

      if (!res.ok) {
        throw await ApiError.handleResponse(res);
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success(t('trips.api.success.stationStatusUpdated'));
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
};
