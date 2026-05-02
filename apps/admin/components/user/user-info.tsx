'use client';
import { adminAuthClient } from '@repo/auth/admin/client';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/web/src/components/ui/alert-dialog';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Separator } from '@repo/design-system/web/src/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/web/src/components/ui/sheet';
import { SidebarMenuButton, SidebarMenuItem } from '@repo/design-system/web/src/components/ui/sidebar';
import { ChevronsUpDown, LogOut, Mail, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
export const UserInfo = () => {
  const router = useRouter();
  const user = useUser();
  const handleLogout = async () => {
    await adminAuthClient.signOut();
    router.push('/login');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="bg-background shadow-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          >
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.fullName}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-1 sm:max-w-sm">
        <SheetHeader>
          <div className="flex-1 text-left">
            <SheetTitle className="text-xl">{user?.fullName}</SheetTitle>
            <SheetDescription className="text-sm">{user?.email}</SheetDescription>
          </div>
        </SheetHeader>

        <Separator />

        {/* Account Information */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div>
            <h3 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <User className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">Full Name</p>
                  <p className="truncate font-medium">{user?.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <Mail className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">Email Address</p>
                  <p className="truncate font-medium">{user?.email}</p>
                </div>
              </div>

              {user?.profile?.phoneNumber && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Phone className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">Phone Number</p>
                    <p className="font-medium">{user.profile.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Logout Button */}
        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="lg" variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to logout?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-0.5 h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
