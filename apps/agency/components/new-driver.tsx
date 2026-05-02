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
import { NewDriverForm } from '@/components/new-driver-form';

export const NewDriver = () => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('dialogs.createDriver')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addDriver')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillAddDriver')}</DialogDescription>
        </DialogHeader>
        <NewDriverForm setOpenAction={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
