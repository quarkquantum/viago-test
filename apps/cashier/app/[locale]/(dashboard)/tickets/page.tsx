import type { Metadata } from 'next';
import { Tickets } from '@/app/[locale]/_components/tickets';

export const metadata: Metadata = {
  description: 'Tickets Page',
  title: 'Tickets',
};

const Page = () => <Tickets />;

export default Page;
