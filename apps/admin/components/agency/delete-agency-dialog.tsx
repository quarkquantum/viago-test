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
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteAgency } from '@/features/agencies/api/use-delete-agency';

type DeleteAgencyDialogProps = {
  agencyId: string;
};

import { useTranslations } from 'next-intl';

export const DeleteAgencyDialog = ({ agencyId }: DeleteAgencyDialogProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteAgency, isPending } = useDeleteAgency({
    onSuccess: () => {
      setOpen(false);
      router.push('/agencies');
    },
  });

  const handleDelete = async () => {
    await deleteAgency(agencyId);
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          {t('common.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('agencies.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('agencies.delete.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton disabled={isPending} holdDuration={2000} onHoldComplete={handleDelete} variant="destructive">
            {isPending ? t('agencies.delete.deleting') : t('agencies.delete.submit')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
