import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.agency)['$get']>;
export type Me = ResponseType;

export const useGetMyAgency = () =>
  useQuery<ResponseType, Error>({
    queryKey: ['me', 'agency'],
    queryFn: async () => {
      const response = await client.api.agency.$get();
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
  });
