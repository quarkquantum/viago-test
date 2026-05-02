import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.agency.requests.$post>;
type RequestType = InferRequestType<typeof client.api.agency.requests.$post>['json'];

export const useCreateAgencyRequest = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.agency.requests.$post({
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });
};
