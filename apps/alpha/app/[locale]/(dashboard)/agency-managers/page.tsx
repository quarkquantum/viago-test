import type { Metadata } from 'next';
import { AgencyManagers } from '@/app/[locale]/_components/agency-managers';

export const metadata: Metadata = {
  description: 'Agency managers management page',
  title: 'Agency Managers',
};

const Page = () => <AgencyManagers />;

export default Page;