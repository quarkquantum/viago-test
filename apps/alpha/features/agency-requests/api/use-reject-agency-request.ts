import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-requests'][':identifier']['reject']['$patch']>;

export const useRejectAgencyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, { identifier: string; rejectionReason?: string }>({
    mutationFn: async ({ identifier, rejectionReason }) => {
      const response = await client.api.alpha['agency-requests'][':identifier'].reject.$patch({
        param: { identifier },
        json: { rejectionReason },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Agency request rejected');
      queryClient.invalidateQueries({ queryKey: ['agency-requests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject agency request');
    },
  });
};
