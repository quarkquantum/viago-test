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
import { Building, Building2, BusFront, LayoutDashboard, Route, Ticket, UserCog, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserInfo } from '@/components/user-info';
import { useAgency } from '@/hooks/useAgency';

const nav: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'navigation.dashboard',
  },
  { href: '/trips', icon: Route, label: 'navigation.trips' },
  { href: '/bookings', icon: Ticket, label: 'navigation.bookings' },
  { href: '/buses', icon: BusFront, label: 'navigation.buses' },
  { href: '/drivers', icon: Users, label: 'navigation.drivers' },
  { href: '/locations', icon: Building, label: 'navigation.locations' },
  { href: '/managers', icon: UserCog, label: 'navigation.managers' },
  { href: '/cashiers', icon: Users, label: 'navigation.cashiers' },
  { href: '/myagency', icon: Building2, label: 'navigation.myAgency' },
];
export const AppSidebar = () => {
  const t = useTranslations('common');
  const pathname = usePathname();
  const path = `/${pathname.split('/')[1]}`;
  const { agency, isPending } = useAgency();

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b">
        <Link href="/">
          <Image alt="Logo" className="w-48 p-6" src={Logo} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-row items-center gap-3 px-4 pt-4 pb-2">
          {isPending ? (
            <div className="flex w-full items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ) : (
            <>
              <Avatar className="size-10 border">
                <AvatarImage src={agency?.logo || undefined} />
                <AvatarFallback>
                  <Building2 className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <p className="truncate font-semibold text-sm">{agency?.name}</p>
                <p className="truncate text-muted-foreground text-xs">{agency?.description}</p>
              </div>
            </>
          )}
        </SidebarGroup>
        <SidebarGroup className="gap-2">
          {nav.map((item) => (
            <NavButton key={item.label} {...item} label={t(item.label)} selected={path === item.href} />
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
