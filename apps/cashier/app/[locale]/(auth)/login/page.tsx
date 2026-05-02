import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  description: 'Login page',
  title: 'Login',
};
const Page = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <LoginForm />
  </div>
);

export default Page;
