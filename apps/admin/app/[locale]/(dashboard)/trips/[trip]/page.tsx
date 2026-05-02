import type { Metadata } from 'next';
import { Trip } from '@/app/[locale]/_components/trip';

export async function generateMetadata({ params }: { params: Promise<{ trip: string }> }): Promise<Metadata> {
  const { trip } = await params;
  return {
    title: `${trip}`,
  };
}

const Page = () => <Trip />;

export default Page;
