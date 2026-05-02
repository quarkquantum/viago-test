import type { Metadata } from 'next';
import { AgencyRequests } from '@/app/[locale]/_components/agency-requests';

export const metadata: Metadata = {
  description: 'Agency Requests Page',
  title: 'Agency Requests',
};

const Page = () => <AgencyRequests />;

export default Page;
