import type { Metadata } from 'next';
import { Cashiers } from '@/app/[locale]/_components/cashiers';

export const metadata: Metadata = {
  description: 'Cashiers Page',
  title: 'Cashiers',
};

const Page = () => <Cashiers />;

export default Page;
