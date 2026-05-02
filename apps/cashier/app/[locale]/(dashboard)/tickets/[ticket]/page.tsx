import type { Metadata } from 'next';
import { Ticket } from '@/app/[locale]/_components/ticket';

export const metadata: Metadata = {
  description: 'Tickets Page',
  title: 'Tickets',
};

const Page = () => <Ticket />;

export default Page;
