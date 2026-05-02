import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.admins)[':identifier']['$get']>;

export type AdminType = ResponseType;

export const useGetAdmin = (id: string) =>
  useQuery<AdminType, Error>({
    queryFn: async () => {
      const response = await client.api.alpha.admins[':identifier'].$get({
        param: { identifier: id },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['admin', { id }],
  });
