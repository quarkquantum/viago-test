import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';
import { useTranslations } from 'next-intl';

type ResponseType = InferResponseType<typeof client.api.alpha.admins.$post>;
type RequestType = InferRequestType<typeof client.api.alpha.admins.$post>['json'];

export const useCreateAdmin = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const t = useTranslations();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.alpha.admins.$post({
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('admin.success.created'));
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
  });
};
