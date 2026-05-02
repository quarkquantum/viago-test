'use client';

import { cashierAuthClient } from '@repo/auth/cashier/client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

export const ForcePasswordChange = () => {
  const user = useUser();
  const router = useRouter();
  const triggered = useRef(false);

  useEffect(() => {
    if (!user?.mustChangePassword || triggered.current) {
      return;
    }
    triggered.current = true;

    const requestReset = async () => {
      try {
        await cashierAuthClient.requestPasswordReset({
          email: user.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        await cashierAuthClient.signOut();
        toast.info('A password reset link has been sent to your email. Please set a new password to continue.');
        router.push('/login');
      } catch (error) {
        toast.error('Unable to start password reset. Please try again or contact support.');
      }
    };

    requestReset();
  }, [router, user]);

  return null;
};
