import type { Metadata } from 'next';
import { Locations } from '@/app/[locale]/_components/locations';

export const metadata: Metadata = {
  description: 'Locations Page',
  title: 'Locations',
};

const Page = () => <Locations />;

export default Page;
