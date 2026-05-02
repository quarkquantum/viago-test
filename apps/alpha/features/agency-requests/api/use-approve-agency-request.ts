import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-requests'][':identifier']['approve']['$patch']>;

export const useApproveAgencyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, string>({
    mutationFn: async (identifier: string) => {
      const response = await client.api.alpha['agency-requests'][':identifier'].approve.$patch({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Agency request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['agency-requests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve agency request');
    },
  });
};
