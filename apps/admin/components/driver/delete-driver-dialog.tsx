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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteDriver } from '@/features/drivers/api/use-delete-driver';

type DeleteDriverDialogProps = {
  driverId: string;
};

import { useTranslations } from 'next-intl';

export const DeleteDriverDialog = ({ driverId }: DeleteDriverDialogProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteDriver, isPending } = useDeleteDriver({
    onSuccess: () => {
      setOpen(false);
      router.push('/drivers');
    },
  });

  const handleDelete = async () => {
    await deleteDriver(driverId);
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
          <AlertDialogTitle>{t('drivers.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('drivers.delete.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton disabled={isPending} holdDuration={2000} onHoldComplete={handleDelete} variant="destructive">
            {isPending ? t('drivers.delete.deleting') : t('drivers.delete.submit')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
