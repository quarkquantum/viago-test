'use client';

import { adminAuthClient } from '@repo/auth/admin/client';

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
  profile?: UserProfile | null;
};

export const useUser = () => {
  const { data } = adminAuthClient.useSession();
  if (!data?.user) {
    return null;
  }

  return data.user as unknown as User;
};
