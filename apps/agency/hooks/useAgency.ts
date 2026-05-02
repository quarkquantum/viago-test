import { useGetMyAgency } from '@/features/me/api/use-get-my-agency';

export const useAgency = () => {
  const { data, isPending } = useGetMyAgency();
  const agency = data?.data.agency;
  const user = data?.data.agencyUser;
  return { agency, isPending, user };
};
