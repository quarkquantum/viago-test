import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.agency.trips)[':identifier']['$put']>;
type RequestType = InferRequestType<(typeof client.api.agency.trips)[':identifier']['$put']>['json'];

export const useUpdateTrip = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('trips');

  return useMutation<ResponseType, Error, RequestType & { identifier: string }>({
    mutationFn: async ({ identifier, ...json }) => {
      const response = await client.api.agency.trips[':identifier'].$put({
        json,
        param: { identifier },
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
    onSuccess: (_, variables) => {
      toast.success(t('api.success.updated'));
      // Invalidate trips list
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Invalidate the specific trip to refresh it
      queryClient.invalidateQueries({
        queryKey: ['me', 'trip', variables.identifier],
      });
      options?.onSuccess?.();
    },
  });
};
