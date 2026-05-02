'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Pen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UpdateTripForm } from '@/components/update-trip-form';

export const UpdateTrip = ({ tripId }: { tripId: string }) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen />
          {t('dialogs.updateTrip')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('dialogs.updateTrip')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillUpdateTrip')}</DialogDescription>
        </DialogHeader>
        <UpdateTripForm setOpenAction={setOpen} tripId={tripId} />
      </DialogContent>
    </Dialog>
  );
};
