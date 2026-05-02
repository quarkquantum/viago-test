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
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteTrip } from '@/features/trips/api/use-delete-trip';
import { useGetTrip } from '@/features/trips/api/use-get-trip';

type DeleteTripDialogProps = {
  tripId: string;
};

export const DeleteTripDialog = ({ tripId }: DeleteTripDialogProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: tripData, isLoading } = useGetTrip(tripId);
  const { mutateAsync: deleteTrip, isPending } = useDeleteTrip({
    onSuccess: () => {
      setOpen(false);
      router.push('/trips');
    },
  });

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
          <AlertDialogTitle>{t('trips.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('trips.delete.description')}
            {!isLoading && tripData && (
              <ul className="mt-2 list-inside list-disc">
                <li>{t('trips.delete.stations', { count: tripData.stations.length })}</li>
                <li>{t('trips.delete.bookings', { count: tripData.bookings.length })}</li>
                <li>{t('trips.delete.transactions')}</li>
              </ul>
            )}
            {isLoading && <p className="mt-2 text-sm italic">{t('trips.delete.calculating')}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <HoldButton
            disabled={isPending}
            holdDuration={2000}
            onHoldComplete={async () => {
              await deleteTrip(tripId);
              router.push('/trips');
            }}
            variant="destructive"
          >
            {isPending ? t('trips.delete.deleting') : t('trips.delete.submit')}
          </HoldButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
