import type { Metadata } from 'next';
import { Dashboard } from '@/app/[locale]/_components/dashboard';

export const metadata: Metadata = {
  description: 'Dashboard Page',
  title: 'Dashboard',
};

const page = () => <Dashboard />;

export default page;
