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
import type { LucideIcon } from 'lucide-react';
import { Building2, LayoutDashboard, FileText, UserCog } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserInfo } from '@/components/user/user-info';

const NAV_KEYS = [
  { href: '/', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/agencies', icon: Building2, key: 'agencies' },
  { href: '/agency-requests', icon: FileText, key: 'agencyRequests' },
  { href: '/agency-managers', icon: UserCog, key: 'agencyManagers' },
] as const;

export const AppSidebar = () => {
  const t = useTranslations('common');
  const pathname = usePathname();
  const path = pathname.split('/').length > 2 ? `/${pathname.split('/')[2]}` : '/';

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b">
        <Link href="/">
          <Image alt="Logo" className="w-48 p-6" src={Logo} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-2">
          {NAV_KEYS.map((item) => (
            <NavButton
              href={item.href}
              icon={item.icon}
              key={item.key}
              label={t(`navigation.${item.key}`)}
              selected={path === item.href}
            />
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
