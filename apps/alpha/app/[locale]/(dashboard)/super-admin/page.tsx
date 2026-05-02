import type { Metadata } from 'next';
import { SuperAdminDetails } from '@/app/[locale]/_components/super-admin-details';

export const metadata: Metadata = {
  title: 'Super Admin Profile',
  description: 'Manage your super administrator profile.',
};

export default function SuperAdminPage() {
  return <SuperAdminDetails />;
}
