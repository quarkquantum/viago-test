import type { Metadata } from 'next';
import { Agencies } from '@/app/[locale]/_components/agencies';

export const metadata: Metadata = {
  description: 'Agencies Page',
  title: 'Agencies',
};

const Page = () => <Agencies />;

export default Page;
