'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/web/src/components/ui/breadcrumb';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';

export const Navbar = ({ toggleSidebar }: { toggleSidebar: ReactElement }) => {
  const t = useTranslations('common');
  const pathname = usePathname();
  // pathname from next-intl already strips locale (e.g. /trips)
  // split('/') -> ['', 'trips']
  const segments = pathname.split('/').filter(Boolean);

  // Last segment is page label (e.g. 'trips' or '123')
  const pageLabel = segments.at(-1);
  // Links are intermediate segments (none if just /trips)
  const links = segments.slice(0, -1);

  return (
    <div className="flex h-16 w-full items-center gap-6 border-b bg-white px-4">
      {toggleSidebar}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>VIAGO</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {links.map((link, index) => {
            // Reconstruct path for Link
            const href = `/${links.slice(0, index + 1).join('/')}`;
            return (
              <div className="flex items-center gap-2" key={link}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={href}>{link.charAt(0).toUpperCase() + link.slice(1)}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </div>
            );
          })}
          <BreadcrumbItem>
            <BreadcrumbPage>
              {pageLabel ? pageLabel.charAt(0).toUpperCase() + pageLabel.slice(1) : t('navigation.dashboard')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </div>
  );
};
