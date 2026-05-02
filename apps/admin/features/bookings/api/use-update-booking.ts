import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.bookings)[':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.admin.bookings)[':identifier']['$patch']>;

export const useUpdateBooking = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('bookings');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (request) => {
      const response = await client.api.admin.bookings[':identifier'].$patch(request);
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
    onSuccess: (_, variables) => {
      toast.success(t('api.success.updated'));
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({
        queryKey: ['me', 'booking', variables.param.identifier],
      });
      options?.onSuccess?.();
    },
  });
};
