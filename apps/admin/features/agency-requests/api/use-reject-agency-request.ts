import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.admin)['agency-requests'][':identifier']['reject']['$patch']
>;

export const useRejectAgencyRequest = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agencyRequests');

  return useMutation<ResponseType, Error, { identifier: string; rejectionReason?: string }>({
    mutationFn: async ({ identifier, rejectionReason }) => {
      const response = await client.api.admin['agency-requests'][':identifier'].reject.$patch({
        param: { identifier },
        json: { rejectionReason },
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
      toast.success(t('api.success.rejected'));
      queryClient.invalidateQueries({ queryKey: ['agency-requests'] });
      options?.onSuccess?.();
    },
  });
};
