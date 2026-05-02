import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { TicketPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UpdateCashierForm } from '@/components/cashier/update-cashier-form';
import { useGetCashier } from '@/features/cashiers/api/use-get-cashier';

export const UpdateCashier = ({ id }: { id: string }) => {
  const t = useTranslations('cashiers');
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useGetCashier(id);

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-8 text-center">{t('edit.loading')}</div>;
    }

    if (error) {
      return <div className="py-8 text-center text-red-500">{t('edit.error')}</div>;
    }

    if (!(data?.cashier?.user && data?.cashier?.agency)) {
      return <div className="py-8 text-center">{t('edit.notFound')}</div>;
    }

    // Create a flattened cashier object for the form

    return <UpdateCashierForm agency={data.cashier.agency} cashier={data.cashier.user} id={id} setOpen={setOpen} />;
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <TicketPlus />
          {t('edit.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
