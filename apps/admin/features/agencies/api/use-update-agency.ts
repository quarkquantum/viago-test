import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.agencies)[':identifier']['$put']>;
type RequestType = InferRequestType<(typeof client.api.admin.agencies)[':identifier']['$put']>['json'];

export const useUpdateAgency = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agencies');

  return useMutation<ResponseType, Error, { identifier: string; json: RequestType }>({
    mutationFn: async ({ identifier, json }) => {
      const response = await client.api.admin.agencies[':identifier'].$put({
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
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['agency', identifier] });
      options?.onSuccess?.();
    },
  });
};
