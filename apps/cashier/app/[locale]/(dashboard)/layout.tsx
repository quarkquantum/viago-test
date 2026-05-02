import { SidebarProvider, SidebarTrigger } from '@repo/design-system/web/src/components/ui/sidebar';
import type React from 'react';
import { Navbar } from '@/components/navbar';
import { AppSidebar } from '@/components/sidebar';
import { ForcePasswordChange } from '@/components/force-password-change';

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <SidebarProvider>
    <ForcePasswordChange />
    <AppSidebar />
    <main className="min-h-full w-full min-w-0 overflow-y-auto overflow-x-hidden">
      <Navbar toggleSidebar={<SidebarTrigger />} />
      <div className="p-4">{children}</div>
    </main>
  </SidebarProvider>
);

export default DashboardLayout;
