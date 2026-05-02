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
import { useDeleteBus } from '@/features/buses/api/use-delete-bus';

type DeleteBusDialogProps = {
  busId: string;
};

import { useTranslations } from 'next-intl';

export const DeleteBusDialog = ({ busId }: DeleteBusDialogProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteBus, isPending } = useDeleteBus({
    onSuccess: () => {
      setOpen(false);
      router.push('/buses');
    },
  });

  const handleDelete = async () => {
    await deleteBus(busId);
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
          <AlertDialogTitle>{t('buses.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('buses.delete.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton disabled={isPending} holdDuration={2000} onHoldComplete={handleDelete} variant="destructive">
            {isPending ? t('buses.delete.deleting') : t('buses.delete.submit')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
