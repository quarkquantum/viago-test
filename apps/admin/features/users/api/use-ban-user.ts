import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.users)[':identifier']['ban']['$put']>;
type RequestType = InferRequestType<(typeof client.api.admin.users)[':identifier']['ban']['$put']>;

export const useBanUser = (identifier?: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('users');

  return useMutation<ResponseType, Error, RequestType['json']>({
    mutationFn: async (json) => {
      if (!identifier) {
        throw new Error('User identifier is required');
      }
      const response = await client.api.admin.users[':identifier'].ban.$put({
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
      options?.onError?.();
    },
    onSuccess: () => {
      toast.success(t('api.success.banned'));
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['passenger', identifier] });
      options?.onSuccess?.();
    },
  });
};
