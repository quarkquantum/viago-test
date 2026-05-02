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

type DeleteDriverDialogProps = {
  driverId: string;
};

export const DeleteDriverDialog = ({ driverId }: DeleteDriverDialogProps) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteDriver, isPending } = useDeleteDriver({
    onSuccess: () => {
      setOpen(false);
    },
  });
  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash />
          {t('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.cannotUndo')} {t('dialogs.deleteDriver')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={isPending}
            onHoldComplete={() => {
              deleteDriver(driverId);
            }}
            variant="destructive"
          >
            {t('dialogs.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
