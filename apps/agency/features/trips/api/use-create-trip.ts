import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.agency.trips.$post>;
type RequestType = InferRequestType<typeof client.api.agency.trips.$post>['json'];

export const useCreateTrip = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('trips');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.agency.trips.$post({
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
    onSuccess: (_, variables) => {
      toast.success(t('api.success.created'));
      // Invalidate trips list
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Invalidate the specific trip to refresh seat availability
      if (variables.busId) {
        queryClient.invalidateQueries({
          queryKey: ['me', 'trip', variables.busId],
        });
      }
      options?.onSuccess?.();
    },
  });
};
