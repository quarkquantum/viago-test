import type { Metadata } from 'next';
import { Cashier } from '@/app/[locale]/_components/cashier';

export const metadata: Metadata = {
  title: 'Cashier',
  description: 'Cashier Page',
};

const Page = () => <Cashier />;

export default Page;
