import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.admin.buses.$post>;
type RequestType = InferRequestType<typeof client.api.admin.buses.$post>['json'];

export const useCreateBus = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('buses');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.buses.$post({
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
      toast.success(t('api.success.created'));
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      options?.onSuccess?.();
    },
  });
};
