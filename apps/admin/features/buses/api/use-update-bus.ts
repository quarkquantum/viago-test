import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.buses)[':identifier']['$put']>;
type RequestType = InferRequestType<(typeof client.api.admin.buses)[':identifier']['$put']>['json'];

export const useUpdateBus = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('buses');

  return useMutation<ResponseType, Error, RequestType & { identifier: string }>({
    mutationFn: async ({ identifier, ...json }) => {
      const response = await client.api.admin.buses[':identifier'].$put({
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
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      queryClient.invalidateQueries({ queryKey: ['bus', variables.identifier] });
      options?.onSuccess?.();
    },
  });
};
