import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { onlineManager } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { enqueue } from '@/lib/offline-queue';

type ResponseType = InferResponseType<(typeof client.api.driver.trips)[':identifier']['start']['$post']>;

type RequestType = InferRequestType<(typeof client.api.driver.trips)[':identifier']['start']['$post']>['param'];

export const useStartTrip = (options?: Omit<UseMutationOptions<ResponseType, Error, RequestType>, 'mutationFn'>) =>
  useMutation<ResponseType, Error, RequestType>({
    networkMode: 'offlineFirst',
    mutationFn: async (param) => {
      if (!onlineManager.isOnline()) {
        enqueue({ type: 'START_TRIP', payload: param });
        return {} as ResponseType;
      }

      const response = await client.api.driver.trips[':identifier'].start.$post({
        param,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return response.json();
    },
    ...options,
  });
