'use client';
import { agencyAuthClient } from '@repo/auth/agency/client';

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
  profile: UserProfile;
};

export const useUser = () => {
  const { data } = agencyAuthClient.useSession();
  const user = data?.user as unknown as User;
  return user;
};
