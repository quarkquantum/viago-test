import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.app.me.$patch>;
type RequestType = InferRequestType<typeof client.api.app.me.$patch>['json'];

export const useUpdateMyProfile = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.app.me.$patch({ json });
      return (await response.json()) as ResponseType;
    },
    onError: (error) => {
      toast.error(t(error.message));
    },
    onSuccess: (data) => {
      toast.success(t(data.message));
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
    },
  });
};
