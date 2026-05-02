import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { type AgencyStatus, ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.admin.agencies.$post>;
type RequestType = InferRequestType<typeof client.api.admin.agencies.$post>['json'];

export const useCreateAgency = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agencies');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.agencies.$post({
        json: {
          ...json,
          status: json.status as AgencyStatus,
        },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return (await response.json()) as ResponseType;
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
    onSuccess: () => {
      toast.success(t('api.success.created'));
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      options?.onSuccess?.();
    },
  });
};
