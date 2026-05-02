import type { Metadata } from 'next';
import { Admins } from '@/app/[locale]/_components/admins';

export const metadata: Metadata = {
  description: 'Admins management page',
  title: 'Admins',
};

const Page = () => <Admins />;

export default Page;
