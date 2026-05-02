'use client';

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
import { HoldButton } from '@repo/design-system/web/src/components/ui/hold-button';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteAdmin } from '@/features/admins/api/use-delete-admin';
import { useRouter } from '@/i18n/routing';

export function DeleteAdminDialog({ adminId }: { adminId: string }) {
  const router = useRouter();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const deleteAdmin = useDeleteAdmin();

  const handleDelete = () => {
    deleteAdmin.mutate(adminId, {
      onSuccess: () => {
        setOpen(false);
        router.push('/admins');
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.dialogs.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('admins.deleteDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={deleteAdmin.isPending}
            holdDuration={2000}
            onHoldComplete={handleDelete}
            variant="destructive"
          >
            {deleteAdmin.isPending ? t('admins.deleting') : t('admins.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
