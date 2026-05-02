import type { Metadata } from 'next';
import { AgencyDetails } from '@/app/[locale]/_components/agency-details';

export async function generateMetadata({ params }: { params: Promise<{ identifier: string }> }): Promise<Metadata> {
  const { identifier } = await params;
  return {
    title: `${identifier}`,
    description: `Details for agency ${identifier}`,
  };
}

const Page = () => <AgencyDetails />;

export default Page;
