'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteUser } from '@/features/users/api/use-delete-user';

export const DeleteUserDialog = ({ userId }: { userId: string }) => {
  const t = useTranslations('passengers.delete');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      setOpen(false);
      window.location.href = '/users';
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash2 className="mr-2 size-4 text-destructive" />
          {tc('delete')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button disabled={deleteUser.isPending} onClick={() => deleteUser.mutate(userId)} variant="destructive">
            {deleteUser.isPending ? t('deleting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
