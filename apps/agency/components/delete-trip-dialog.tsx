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
import { useDeleteTrip } from '@/features/trips/api/use-delete-trip';

type DeleteTripDialogProps = {
  tripId: string;
};

export const DeleteTripDialog = ({ tripId }: DeleteTripDialogProps) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteTrip, isPending } = useDeleteTrip({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleDelete = async () => {
    await deleteTrip(tripId);
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          {t('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.cannotUndo')} {t('dialogs.deleteTrip')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <HoldButton disabled={isPending} holdDuration={2000} onHoldComplete={handleDelete} variant="destructive">
            {isPending ? t('dialogs.deleting') : t('dialogs.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
