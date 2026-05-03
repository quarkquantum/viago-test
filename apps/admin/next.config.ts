import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@repo/ui'],
  images: {
    remotePatterns: [
      {
        hostname: '**',
        protocol: 'https',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
