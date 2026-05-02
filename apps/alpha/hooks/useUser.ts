import { useSession } from '@repo/auth/alpha/client';

export type UserProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  image: string;
  emailVerified: boolean;
  role: string;
  profile: UserProfile;
};

export const useUser = () => {
  const { data } = useSession();
  const user = data?.user as unknown as User;
  return user;
};
