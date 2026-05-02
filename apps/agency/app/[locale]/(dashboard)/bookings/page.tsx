import type { Metadata } from 'next';
import { Bookings } from '@/app/[locale]/_components/bookings';

export const metadata: Metadata = {
  description: 'Bookings Page',
  title: 'Bookings',
};

const Page = () => <Bookings />;

export default Page;
