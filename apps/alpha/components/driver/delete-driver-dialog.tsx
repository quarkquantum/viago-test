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
import { Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteDriver } from '@/features/drivers/api/use-delete-driver';
import { useRouter } from '@/i18n/routing';

type DeleteDriverDialogProps = {
  driverId: string;
};

export const DeleteDriverDialog = ({ driverId }: DeleteDriverDialogProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteDriver, isPending } = useDeleteDriver();

  const handleDelete = async () => {
    try {
      await deleteDriver(driverId);
      setOpen(false);
      router.push('/drivers');
    } catch (error) {
      console.error('Failed to delete driver:', error);
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          {t('common.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.dialogs.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('drivers.deleteDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton disabled={isPending} holdDuration={2000} onHoldComplete={handleDelete} variant="destructive">
            {isPending ? t('drivers.deleting') : t('drivers.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
