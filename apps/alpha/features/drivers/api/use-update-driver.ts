import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.drivers)[':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.alpha.drivers)[':identifier']['$patch']>['json'];

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('drivers');

  return useMutation<ResponseType, Error, { identifier: string; json: RequestType }>({
    mutationFn: async ({ identifier, json }) => {
      const response = await client.api.alpha.drivers[':identifier'].$patch({
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
    },
    onSuccess: (_, { identifier }) => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', identifier] });
    },
  });
};
