'use client';
import { cashierAuthClient } from '@repo/auth/cashier/client';

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
  mustChangePassword?: boolean;
  profile: UserProfile;
};

export const useUser = () => {
  const { data } = cashierAuthClient.useSession();
  const user = data?.user as unknown as User;
  return user;
};
