import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UpdateTicketForm } from '@/components/ticket/update-ticket-form';

type UpdateTicketProps = {
  id: string;
};

export const UpdateTicket = ({ id }: UpdateTicketProps) => {
  const t = useTranslations('tickets');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pencil />
          {t('edit.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>
        <UpdateTicketForm id={id} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
