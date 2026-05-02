import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.app.payments.init.$post>;
type RequestType = InferRequestType<typeof client.api.app.payments.init.$post>['json'];

export const useInitPayment = (options?: Omit<UseMutationOptions<ResponseType, Error, RequestType>, 'mutationFn'>) =>
  useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (data) => {
      const response = await client.api.app.payments.init.$post({
        json: data,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    ...options,
  });
