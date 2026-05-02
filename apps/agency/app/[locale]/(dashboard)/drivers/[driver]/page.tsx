import type { Metadata } from 'next';
import { Driver } from '@/app/[locale]/_components/driver';

export const metadata: Metadata = {
  description: 'Driver page',
  title: 'Driver',
};

const Page = () => <Driver />;

export default Page;
