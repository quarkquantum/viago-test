'use client';
import Logo from '@repo/design-system/web/src/assets/logo.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@repo/design-system/web/src/components/ui/sidebar';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { SystemRoles } from '@repo/shared';
import type { LucideIcon } from 'lucide-react';
import { Building2, BusIcon, DollarSign, FileText, LayoutDashboardIcon, ShieldCheck, UserSquare2Icon, UsersIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UserInfo } from '@/components/user-info';
import { useUser } from '@/hooks/useUser';
import { Link, usePathname } from '@/i18n/routing';

export const AppSidebar = () => {
  const t = useTranslations('common');
  const pathname = usePathname();

  const nav: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[] = [
    { href: '/', icon: LayoutDashboardIcon, label: t('navigation.dashboard') },
    { href: '/agencies', icon: Building2, label: t('navigation.agencies') },
    { href: '/agency-requests', icon: FileText, label: t('navigation.agencyRequests') },
    { href: '/agency-managers', icon: UsersIcon, label: t('navigation.agencyManagers') },
    { href: '/admins', icon: UserSquare2Icon, label: t('navigation.admins') },
    { href: '/billing', icon: DollarSign, label: t('navigation.billing') },
  ];

  const user = useUser();
  const isSuperAdmin = user?.role === SystemRoles.SUPER_ADMIN;

  const finalNav = [...nav];
  if (isSuperAdmin) {
    finalNav.push({
      href: '/super-admin',
      icon: ShieldCheck,
      label: t('navigation.superAdmin'),
    });
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b">
        <Link href="/">
          <Image alt="Logo" className="w-48 p-6" src={Logo} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-2">
          {finalNav.map((item) => {
            const isSelected =
              item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <NavButton key={item.label} {...item} selected={isSelected} />;
          })}
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
