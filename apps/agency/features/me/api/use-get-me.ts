import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.agency.me)['$get']>;
export type Me = ResponseType;

export const useGetMe = () =>
  useQuery<ResponseType, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await client.api.agency.me.$get();
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
  });
