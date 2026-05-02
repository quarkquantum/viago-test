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
import { useGetAgencyManager } from '@/features/agency-managers/api/use-get-agency-manager';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { UpdateAgencyManagerForm } from './update-agency-manager-form';
import { Select } from '@/components/select';

type UpdateAgencyManagerProps = {
  id: string;
};

export function UpdateAgencyManager({ id }: UpdateAgencyManagerProps) {
  const t = useTranslations('agencyOwner');
  const [open, setOpen] = useState(false);
  const { data: manager, isLoading } = useGetAgencyManager(id);
  const { data: agenciesData } = useListAgencies({ limit: '100' });

  const agencies = agenciesData?.data?.map((agency) => ({
    value: agency.id,
    label: agency.name,
  })) ?? [];

  if (isLoading || !manager || 'message' in manager) {
    return (
      <Button disabled variant="outline">
        <Pen className="mr-2 h-4 w-4" /> {t('edit')}
      </Button>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen className="mr-2 h-4 w-4" /> {t('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
          <DialogDescription>{t('editDescription')}</DialogDescription>
        </DialogHeader>
        <UpdateAgencyManagerForm agencyManager={manager.data} agencies={agencies} id={id} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
