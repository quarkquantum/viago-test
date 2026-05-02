import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseMutationOptions } from '@tanstack/react-query';
import { onlineManager, useMutation } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { enqueue } from '@/lib/offline-queue';

type ResponseType = InferResponseType<typeof client.api.app.booking.$post>;
type RequestType = InferRequestType<typeof client.api.app.booking.$post>['json'];
type QueuedResponse = {
  queued: true;
  localId: string;
};
type MutationResponse = ResponseType | QueuedResponse;

export const useCreateBooking = (
  options?: Omit<UseMutationOptions<MutationResponse, Error, RequestType>, 'mutationFn'>
) =>
  useMutation<MutationResponse, Error, RequestType>({
    networkMode: 'offlineFirst',
    mutationFn: async (data) => {
      if (!onlineManager.isOnline()) {
        const queued = enqueue({
          payload: data,
          type: 'CREATE_BOOKING',
        });
        return {
          queued: true,
          localId: queued.id,
        };
      }

      const response = await client.api.app.booking.$post({
        json: data,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    ...options,
  });
