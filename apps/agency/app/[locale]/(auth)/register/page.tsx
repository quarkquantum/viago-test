import type { Metadata } from 'next';
import { MultiStepRegisterForm } from '@/components/multi-step-register-form';

export const metadata: Metadata = {
  description: 'Register your agency',
  title: 'Register',
};

const Page = () => (
  <div className="flex min-h-screen w-full items-center justify-center p-4">
    <MultiStepRegisterForm />
  </div>
);

export default Page;
