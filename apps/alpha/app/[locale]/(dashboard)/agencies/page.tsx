import type { Metadata } from 'next';
import { Agencies } from '@/app/[locale]/_components/agencies';

export const metadata: Metadata = {
  title: 'Agencies',
  description: 'View and manage all agencies and their performance.',
};

export default function AgenciesPage() {
  return <Agencies />;
}
