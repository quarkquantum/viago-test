import type { Metadata } from 'next';
import { Bus } from '@/app/[locale]/_components/bus';

export async function generateMetadata({ params }: { params: Promise<{ bus: string }> }): Promise<Metadata> {
  const { bus } = await params;
  return {
    title: `${bus}`,
    description: `Details for bus ${bus}`,
  };
}

const Page = () => <Bus />;

export default Page;
