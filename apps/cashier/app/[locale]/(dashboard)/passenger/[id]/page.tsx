import type { Metadata } from 'next';
import { Passenger } from '@/app/[locale]/_components/passenger';

export const metadata: Metadata = {
  description: 'Passenger page',
  title: 'Passenger',
};

const Page = () => <Passenger />;

export default Page;
