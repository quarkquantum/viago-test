import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.alpha.drivers.$post>;
type RequestType = InferRequestType<typeof client.api.alpha.drivers.$post>['json'];

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('drivers');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.alpha.drivers.$post({
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
      toast.success(t('createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};
