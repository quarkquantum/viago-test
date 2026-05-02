import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.agency.cashiers)[':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.agency.cashiers)[':identifier']['$patch']>['json'];

export const useUpdateCashier = (identifier: string, options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('cashiers');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.agency.cashiers[':identifier'].$patch({
        param: { identifier },
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(t('api.success.updated'));
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
      options?.onSuccess?.();
    },
  });
};
