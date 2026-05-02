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
import { NewManagerForm } from '@/components/new-manager-form';

export const NewManager = () => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('dialogs.createManager')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addManager')}</DialogTitle>
          <DialogDescription>{t('dialogs.fillAddManager')}</DialogDescription>
        </DialogHeader>
        <NewManagerForm setOpenAction={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
