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
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteTicket } from '@/features/tickets/api/use-delete-ticket';

type DeleteTicketDialogProps = {
  ticketId: string;
};

export const DeleteTicketDialog = ({ ticketId }: DeleteTicketDialogProps) => {
  const t = useTranslations('tickets');
  const [open, setOpen] = useState(false);
  const deleteTicketMutation = useDeleteTicket(ticketId);

  const handleDelete = () => {
    deleteTicketMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
      },
    });
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
          <AlertDialogTitle>{t('details.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('details.deleteDialog.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={deleteTicketMutation.isPending}
            holdDuration={2000}
            onHoldComplete={handleDelete}
            variant="destructive"
          >
            {deleteTicketMutation.isPending
              ? t('details.deleteDialog.deleting')
              : t('details.deleteDialog.holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
