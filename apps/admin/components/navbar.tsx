'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/web/src/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';

export const Navbar = ({ toggleSidebar }: { toggleSidebar: ReactElement }) => {
  const t = useTranslations('common');
  const pathname = usePathname();
  const pagelabel = pathname.split('/').at(-1) || '';
  const links = pathname.split('/').filter((link) => link !== '' && link !== pagelabel);

  const getLabel = (link: string) => {
    if (!link) {
      return '';
    }
    // Return the label simply capitalized, without translation
    return link.charAt(0).toUpperCase() + link.slice(1);
  };

  return (
    <div className="flex h-16 w-full items-center gap-6 border-b bg-white px-4">
      {toggleSidebar}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>VIAGO</BreadcrumbPage>
          </BreadcrumbItem>
          {links.length > 0 && <BreadcrumbSeparator />}
          {links.map((link) => (
            <div className="flex items-center gap-2" key={link}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${link}`}>{getLabel(link)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </div>
          ))}
          {pagelabel && (
            <>
              {links.length === 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbPage>{getLabel(pagelabel) || t('navigation.dashboard')}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </div>
  );
};
