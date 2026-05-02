import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { useNetwork } from '@/contexts/network-context';
import { client } from '@/lib/hono';
import { peekQueue, type QueuedAction, removeFromQueue } from './offline-queue';

async function replayAction(action: QueuedAction): Promise<void> {
  switch (action.type) {
    case 'CREATE_BOOKING': {
      const res = await client.api.app.booking.$post({
        json: action.payload,
      });
      if (!res.ok) {
        throw new Error('Failed to replay CREATE_BOOKING');
      }
      break;
    }
    default: {
      return;
    }
  }
}

export function useOfflineQueueReplay() {
  const { t } = useTranslation();
  const { isConnected } = useNetwork();
  const queryClient = useQueryClient();
  const replayingRef = useRef(false);

  useEffect(() => {
    if (!isConnected || replayingRef.current) {
      return;
    }

    const drain = async () => {
      const first = peekQueue()[0];
      if (!first) {
        return;
      }

      replayingRef.current = true;
      let replayedCount = 0;

      try {
        let next = peekQueue()[0];

        while (next) {
          try {
            await replayAction(next);
            removeFromQueue(next.id);
            replayedCount += 1;
          } catch {
            toast.error(t('reservation.syncFailed'));
            break;
          }

          next = peekQueue()[0];
        }

        if (replayedCount > 0) {
          toast.success(t('reservation.syncSuccess', { count: replayedCount }));
        }

        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      } finally {
        replayingRef.current = false;
      }
    };

    drain();
  }, [isConnected, queryClient, t]);
}
