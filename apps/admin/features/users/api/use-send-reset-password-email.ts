import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.users)[':identifier']['send-reset-password']['$post']>;

export const useSendResetPasswordEmail = (
  identifier?: string,
  options?: { onSuccess?: () => void; onError?: () => void }
) => {
  const t = useTranslations('users');

  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      if (!identifier) {
        throw new Error('User identifier is required');
      }
      const response = await client.api.admin.users[':identifier']['send-reset-password'].$post({
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
    onSuccess: () => {
      toast.success(t('api.success.resetEmailSent'));
      options?.onSuccess?.();
    },
  });
};
