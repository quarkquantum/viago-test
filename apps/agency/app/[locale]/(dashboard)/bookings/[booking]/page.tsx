import type { Metadata } from 'next';
import { Booking } from '@/app/[locale]/_components/booking';

export const metadata: Metadata = {
  description: 'Booking Details Page',
  title: 'Booking Details',
};

const Page = () => <Booking />;

export default Page;
