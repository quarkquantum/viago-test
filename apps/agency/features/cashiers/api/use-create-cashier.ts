import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.agency.cashiers.$post>;
type RequestType = InferRequestType<typeof client.api.agency.cashiers.$post>['json'];

export const useCreateCashier = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('cashiers');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.agency.cashiers.$post({ json });
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
      toast.success(t('api.success.created'));
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
      options?.onSuccess?.();
    },
  });
};
