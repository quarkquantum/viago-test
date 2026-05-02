'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Pen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGetAdmin } from '@/features/admins/api/use-get-admin';
import { UpdateAdminForm } from './update-admin-form';

type UpdateAdminProps = {
  id: string;
};

export function UpdateAdmin({ id }: UpdateAdminProps) {
  const [open, setOpen] = useState(false);
  const { data: admin, isLoading } = useGetAdmin(id);

  if (isLoading || !admin || 'message' in admin) {
    return (
      <Button disabled variant="outline">
        <Pen className="mr-2 h-4 w-4" /> Edit Admin
      </Button>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen className="mr-2 h-4 w-4" /> Edit Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Update Admin</DialogTitle>
          <DialogDescription>
            Modify the administrator account details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <UpdateAdminForm admin={admin} id={id} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
