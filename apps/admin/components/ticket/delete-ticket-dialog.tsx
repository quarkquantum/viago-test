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
import { useState } from 'react';
import { useDeleteTicket } from '@/features/tickets/api/use-delete-ticket';

type DeleteTicketDialogProps = {
  ticketId: string;
};

import { useTranslations } from 'next-intl';

export const DeleteTicketDialog = ({ ticketId }: DeleteTicketDialogProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const deleteTicketMutation = useDeleteTicket(ticketId, {
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleDelete = async () => {
    await deleteTicketMutation.mutateAsync(undefined);
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button className="text-destructive hover:bg-destructive" size="sm" variant="outline">
          {t('common.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('tickets.details.deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('tickets.details.deleteConfirmDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={deleteTicketMutation.isPending}
            holdDuration={2000}
            onHoldComplete={handleDelete}
            variant="destructive"
          >
            {deleteTicketMutation.isPending ? t('tickets.details.deleting') : t('tickets.details.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
