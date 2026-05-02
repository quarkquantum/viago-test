import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/reset-password-form';

export const metadata: Metadata = {
  description: 'Reset your password',
  title: 'Reset Password',
};

const Page = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  </div>
);

export default Page;
