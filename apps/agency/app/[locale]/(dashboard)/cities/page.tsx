import type { Metadata } from 'next';
import { Locations } from '@/app/[locale]/_components/locations';

export const metadata: Metadata = {
  description: 'Cities Page',
  title: 'Cities',
};

const Page = () => <Locations />;
export default Page;
