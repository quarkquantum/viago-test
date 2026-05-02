import type { Metadata } from 'next';
import { Trips } from '@/app/[locale]/_components/trips';

export const metadata: Metadata = {
  description: 'Trips Page',
  title: 'Trips',
};

const Page = () => <Trips />;

export default Page;
