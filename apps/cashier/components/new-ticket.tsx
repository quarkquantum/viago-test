import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { TripStatus } from '@repo/shared/constants';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NewTicketForm } from '@/components/new-ticket-form';
import type { Trip } from '@/features/trips/api/use-get-trip';

export const NewTicket = ({ trip }: { trip: Trip }) => {
  const t = useTranslations('tickets');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={trip.status === TripStatus.DELETED || trip.status === TripStatus.COMPLETED}>
          {t('create.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('create.modal.title')}</DialogTitle>
          <DialogDescription>{t('create.modal.description')}</DialogDescription>
        </DialogHeader>
        <NewTicketForm setOpen={setOpen} trip={trip} />
      </DialogContent>
    </Dialog>
  );
};
