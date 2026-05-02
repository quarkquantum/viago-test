import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

export const useRevokeUserSession = (identifier: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations('users');

  return useMutation<unknown, Error, string>({
    mutationFn: async (sessionToken: string) => {
      const response = await client.api.admin.users[':identifier'].sessions[':sessionToken'].$delete({
        param: { identifier, sessionToken },
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
      toast.success(t('api.success.sessionRevoked'));
      queryClient.invalidateQueries({ queryKey: ['user-sessions', identifier] });
    },
  });
};
