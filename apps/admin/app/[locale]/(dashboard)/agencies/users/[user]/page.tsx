import type { Metadata } from 'next';
import { AgencyUser } from '@/app/[locale]/_components/agency-user';

export const metadata: Metadata = {
  description: 'Agency User Profile',
  title: 'Agency User',
};

const Page = () => <AgencyUser />;

export default Page;
