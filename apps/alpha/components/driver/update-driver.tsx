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
import { Loader2, UserCog } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UpdateDriverForm } from '@/components/driver/update-driver-form';
import { useGetDriver } from '@/features/drivers/api/use-get-driver';

export const UpdateDriver = ({ id }: { id: string }) => {
  const t = useTranslations('drivers');
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetDriver(id);

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }

  if (!data) {
    return null;
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <UserCog />
          {t('updateDriver')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-96">
        <DialogHeader>
          <DialogTitle>{t('updateDriver')}</DialogTitle>
          <DialogDescription>{t('updateDriverDescription')}</DialogDescription>
        </DialogHeader>
        <UpdateDriverForm agency={data?.data.agency} driver={data?.data} id={id} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
