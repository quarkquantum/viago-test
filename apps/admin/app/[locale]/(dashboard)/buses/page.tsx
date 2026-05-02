import type { Metadata } from 'next';
import { Buses } from '@/app/[locale]/_components/buses';

export const metadata: Metadata = {
  description: 'Dashboard Page',
  title: 'Dashboard',
};
const Page = () => <Buses />;

export default Page;
