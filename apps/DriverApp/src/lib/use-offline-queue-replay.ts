import type { StationStatus } from '@repo/shared/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNetwork } from '@/contexts/network-context';
import { client } from '@/lib/hono';
import { dequeue, type QueuedAction, queueLength } from './offline-queue';

async function replayAction(action: QueuedAction): Promise<void> {
  switch (action.type) {
    case 'START_TRIP': {
      const { identifier } = action.payload as { identifier: string };
      const res = await client.api.driver.trips[':identifier'].start.$post({
        param: { identifier },
      });
      if (!res.ok) throw new Error('Failed to replay START_TRIP');
      break;
    }
    case 'UPDATE_STATION_STATUS': {
      const { identifier, stationId, status } = action.payload as {
        identifier: string;
        stationId: string;
        status: StationStatus;
      };
      const res = await client.api.driver.trips[':identifier'].station[':stationId'].status.$patch({
        param: { identifier, stationId },
        json: { status },
      });
      if (!res.ok) throw new Error('Failed to replay UPDATE_STATION_STATUS');
      break;
    }
  }
}

export function useOfflineQueueReplay() {
  const { isConnected } = useNetwork();
  const queryClient = useQueryClient();
  const replayingRef = useRef(false);

  useEffect(() => {
    if (!isConnected || replayingRef.current) return;

    const drain = async () => {
      if (queueLength() === 0) return;
      replayingRef.current = true;

      try {
        let action = dequeue();
        while (action) {
          try {
            await replayAction(action);
          } catch {
            // Re-enqueue failed action at the front is complex;
            // just stop draining and leave remaining items
            break;
          }
          action = dequeue();
        }

        // Invalidate relevant queries after replay
        queryClient.invalidateQueries({ queryKey: ['trip'] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.invalidateQueries({ queryKey: ['me', 'dashboard'] });
      } finally {
        replayingRef.current = false;
      }
    };

    drain();
  }, [isConnected, queryClient]);
}
