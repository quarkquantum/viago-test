import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.users)[':identifier']['resetpassword']['$put']>;
type RequestType = InferRequestType<(typeof client.api.admin.users)[':identifier']['resetpassword']['$put']>['json'];

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('users');

  return useMutation<ResponseType, Error, { identifier: string; json: RequestType }>({
    mutationFn: async ({ identifier, json }) => {
      const response = await client.api.admin.users[':identifier'].resetpassword.$put({
        json,
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: () => {
      toast.error('Failed to reset password');
    },
    onSuccess: (_, { identifier }) => {
      toast.success(t('api.success.passwordReset'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', identifier] });
    },
  });
};
