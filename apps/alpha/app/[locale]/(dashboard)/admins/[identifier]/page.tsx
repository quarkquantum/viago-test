import type { Metadata } from 'next';
import { Admin } from '@/app/[locale]/_components/admin';

export const metadata: Metadata = {
  description: 'Admin details page',
  title: 'Admin Details',
};

const Page = () => <Admin />;

export default Page;
