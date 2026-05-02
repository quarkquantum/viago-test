'use client';
import Logo from '@repo/design-system/web/src/assets/logo.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/web/src/components/ui/avatar';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@repo/design-system/web/src/components/ui/sidebar';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { cn } from '@repo/design-system/web/src/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Building2, Bus, LayoutDashboard, Search, Ticket, Zap } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserInfo } from '@/components/user-info';
import { QuickSearchDialog } from '@/components/quick-search-dialog';
import { useAgency } from '@/hooks/use-agency';

export const AppSidebar = () => {
  const t = useTranslations('common');
  const pathname = usePathname();
  const path = `/${pathname.split('/')[1]}`;
  const nav: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[] = [
    {
      href: '/',
      icon: LayoutDashboard,
      label: t('navigation.dashboard'),
    },
    { href: '/trips', icon: Bus, label: t('navigation.trips') },
    { href: '/tickets', icon: Ticket, label: t('navigation.tickets') },
    { href: '/quick-sale', icon: Zap, label: t('navigation.quickSale') },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b">
        <Link href="/">
          <Image alt="Logo" className="w-48 p-6" src={Logo} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-2">
          <QuickSearchDialog />
          {nav.map((item) => (
            <NavButton key={item.label} {...item} selected={path === item.href} />
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex h-16 justify-center border-t">
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
};

export const NavButton = ({
  label,
  href,
  icon: Icon,
  selected,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  selected: boolean;
}) => (
  <Button
    asChild
    className={cn(
      'w-full justify-start rounded-lg bg-transparent py-6 text-base text-foreground hover:bg-transparent hover:text-primary/70',
      selected && 'text-primary'
    )}
  >
    <Link href={href}>
      <Icon className="size-6" />
      {label}
    </Link>
  </Button>
);
