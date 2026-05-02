import type { Metadata } from 'next';
import { Agency } from '@/app/[locale]/_components/agency';

export async function generateMetadata({ params }: { params: Promise<{ agency: string }> }): Promise<Metadata> {
  const { agency } = await params;
  return {
    title: `${agency}`,
    description: `Details for agency ${agency}`,
  };
}

const Page = () => <Agency />;

export default Page;
