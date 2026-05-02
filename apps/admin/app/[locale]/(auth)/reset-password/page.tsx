import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/reset-password-form';

export const metadata: Metadata = {
  description: 'Reset your password',
  title: 'Reset Password',
};

const Page = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <ResetPasswordForm />
  </div>
);

export default Page;
