import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.driver.reports.$get>;
type RequestType = InferRequestType<typeof client.api.driver.reports.$get>['query'];
export type DriverReport = NonNullable<ResponseType['data']>[number];

export const useListReports = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.driver.reports.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['driver-reports', query],
  });
