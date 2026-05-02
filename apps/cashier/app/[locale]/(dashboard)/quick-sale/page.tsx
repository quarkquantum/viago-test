import type { Metadata } from 'next';
import { QuickSale } from '@/app/[locale]/_components/quick-sale';

export const metadata: Metadata = {
  description: 'Quick Sale',
  title: 'Quick Sale',
};

const Page = () => <QuickSale />;

export default Page;
