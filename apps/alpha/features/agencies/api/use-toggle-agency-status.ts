import type { InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.agencies)[':identifier']['toggle-status']['$patch']>;

export const useToggleAgencyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, { identifier: string; status: string }>({
    mutationFn: async ({ identifier, status }) => {
      const response = await client.api.alpha.agencies[':identifier']['toggle-status'].$patch({
        param: { identifier },
        json: { status },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['agency'] });
    },
  });
};