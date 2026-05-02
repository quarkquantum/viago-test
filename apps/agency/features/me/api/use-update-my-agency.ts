import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.agency.$patch, 200>;
type RequestType = InferRequestType<typeof client.api.agency.$patch>;

export const useUpdateMyAgency = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agency');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (request) => {
      const response = await client.api.agency.$patch(request);
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
      toast.success(t('api.success.updated'));
      queryClient.invalidateQueries({ queryKey: ['me', 'agency'] });
      options?.onSuccess?.();
    },
  });
};
