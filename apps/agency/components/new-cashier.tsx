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
import { NewCashierForm } from '@/components/new-cashier-form';

export const NewCashier = () => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('dialogs.createCashier')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addCashier')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillAddCashier')}</DialogDescription>
        </DialogHeader>
        <NewCashierForm setOpenAction={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
