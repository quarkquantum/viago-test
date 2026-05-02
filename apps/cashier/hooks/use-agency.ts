import { useGetMe } from '@/features/me/api/use-get-me';

export const useAgency = () => {
  const { data: me, isPending } = useGetMe();
  const agency = me?.agencyMemberships?.[0]?.agency;

  return {
    agency,
    isPending,
  };
};
