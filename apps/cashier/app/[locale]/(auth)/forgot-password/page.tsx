import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export const metadata: Metadata = {
  description: 'Forgot your password?',
  title: 'Forgot Password',
};

const Page = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <ForgotPasswordForm />
  </div>
);

export default Page;
