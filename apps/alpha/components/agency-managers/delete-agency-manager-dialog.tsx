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
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteAgencyManager } from '@/features/agency-managers/api/use-delete-agency-manager';

export function DeleteAgencyManagerDialog({ managerId }: { managerId: string }) {
  const t = useTranslations('agencyOwner');
  const tCommon = useTranslations();
  const [open, setOpen] = useState(false);
  const deleteAgencyManager = useDeleteAgencyManager();

  const handleDelete = () => {
    deleteAgencyManager.mutate(
      { identifier: managerId },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {tCommon('common.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tCommon('common.dialogs.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('common.cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={deleteAgencyManager.isPending}
            holdDuration={2000}
            onHoldComplete={handleDelete}
            variant="destructive"
          >
            {deleteAgencyManager.isPending ? t('deleting') : t('holdToDelete')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}