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
import { UpdateBusForm } from '@/components/update-bus-form';

export const UpdateBus = ({ busId }: { busId: string }) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen />
          {t('dialogs.updateBus')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('dialogs.updateBus')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillUpdateBus')}</DialogDescription>
        </DialogHeader>
        <UpdateBusForm busId={busId} setOpenAction={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
