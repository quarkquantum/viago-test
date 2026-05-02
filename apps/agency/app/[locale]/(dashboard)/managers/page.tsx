import type { Metadata } from 'next';
import { Managers } from '@/app/[locale]/_components/managers';

export const metadata: Metadata = {
  description: 'Managers Page',
  title: 'Managers',
};

const Page = () => <Managers />;
export default Page;
