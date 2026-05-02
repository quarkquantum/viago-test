import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.cashiers)[':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.admin.cashiers)[':identifier']['$patch']>['json'];

export const useUpdateCashier = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('cashiers');

  return useMutation<ResponseType, Error, { identifier: string; json: RequestType }>({
    mutationFn: async ({ identifier, json }) => {
      const response = await client.api.admin.cashiers[':identifier'].$patch({
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
    onSuccess: (_, { identifier }) => {
      toast.success(t('api.success.updated'));
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
      queryClient.invalidateQueries({ queryKey: ['cashier', identifier] });
      options?.onSuccess?.();
    },
  });
};
