import { keys } from './keys';

export const TRUSTED_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  keys().NEXT_PUBLIC_API_URL,
  keys().NEXT_PUBLIC_APP_URL,
  // Vercel deployment URLs
  'https://viago-monorepo-admin.vercel.app',
  'https://viago-monorepo-agency.vercel.app',
  'https://viago-monorepo-alpha.vercel.app',
  'https://viago-monorepo-cashier.vercel.app',
  'https://viago-test-admin.vercel.app',
  // Production domain URLs
  'https://velora-viago.com',
  'https://www.velora-viago.com',
  'https://admin.velora-viago.com',
  'https://agency.velora-viago.com',
  'https://alpha.velora-viago.com',
  'https://cashier.velora-viago.com',
  'https://api.velora-viago.com',
  '*.velora-viago.com',
];
