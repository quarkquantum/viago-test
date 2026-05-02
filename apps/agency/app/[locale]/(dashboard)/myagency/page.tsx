import type { Metadata } from 'next';
import { MyAgency } from '@/app/[locale]/_components/my-agency';

export const metadata: Metadata = {
  description: 'My Agency Page',
  title: 'My Agency',
};

const Page = () => <MyAgency />;

export default Page;
