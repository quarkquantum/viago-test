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
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NewBusForm } from '@/components/new-bus-form';

export const NewBus = () => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('dialogs.createBus')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addBus')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillAddBus')}</DialogDescription>
        </DialogHeader>
        <NewBusForm setOpenAction={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
