import type { TripStatus } from '@repo/shared/constants';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { client } from '@/lib/hono';

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identifier, status }: { identifier: string; status: TripStatus }) => {
      const res = await client.api.driver.trips[':identifier'].status.$patch({
        param: { identifier },
        json: { status },
      });

      if (!res.ok) {
        throw await ApiError.handleResponse(res);
      }

      return res.json();
    },
    onSuccess: (_, { identifier }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', identifier] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });
};
