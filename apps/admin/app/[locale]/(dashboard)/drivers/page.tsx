import type { Metadata } from 'next';
import { Drivers } from '@/app/[locale]/_components/drivers';

export const metadata: Metadata = {
  description: 'Drivers Page',
  title: 'Drivers',
};

const Page = () => <Drivers />;

export default Page;
