'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/web/src/components/ui/alert-dialog';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { BusSeatPolicy, BusStatus } from '@repo/shared';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetBus } from '@/features/buses/api/use-get-bus';
import { useUpdateBus } from '@/features/buses/api/use-update-bus';

const formSchema = z.object({
  licensePlate: z.string().min(1),
  nbrOfSeats: z.number().min(5),
  seatReservationType: z.enum([BusSeatPolicy.UNNUMBERED, BusSeatPolicy.NUMBERED]),
  status: z.enum([
    BusStatus.ACTIVE,
    BusStatus.INACTIVE,
    BusStatus.MAINTENANCE,
    BusStatus.BREAKDOWN,
    BusStatus.OUT_OF_SERVICE,
    BusStatus.TO_REPLACE,
    BusStatus.DELETED,
  ]),
  title: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

import { useTranslations } from 'next-intl';

export const UpdateBusForm = ({ busId, setOpen }: { busId: string; setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const updateBus = useUpdateBus({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });
  const { data: bus, isLoading } = useGetBus(busId);

  const form = useForm<FormValues>({
    defaultValues: {
      licensePlate: bus?.data?.bus?.licensePlate,
      nbrOfSeats: bus?.data?.bus?.maxPlaces,
      seatReservationType: bus?.data?.bus?.seatReservationType as FormValues['seatReservationType'],
      status: bus?.data?.bus?.status as FormValues['status'],
      title: bus?.data?.bus?.title,
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const SeatNumberOptions = [25, 30, 36, 45, 55, 60, 69];

  const onSubmit = (data: FormValues) => {
    // We use the original license plate as the identifier for the update
    // because the backend expects the license plate to find the record.
    // If we used the new license plate (from data), we wouldn't find the existing bus.
    const identifier = bus?.data?.bus?.licensePlate || busId;

    updateBus.mutate({
      identifier,
      licensePlate: data.licensePlate,
      maxPlaces: data.nbrOfSeats,
      seatReservationType: data.seatReservationType,
      status: data.status,
      title: data.title,
    });
  };

  if (isLoading || !bus) {
    return;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          {/* TITLE */}
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.title')}</FieldLabel>
                <Input {...field} placeholder={t('buses.create.modelPlaceholder')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* SEATS */}
          <Controller
            control={form.control}
            name="nbrOfSeats"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.seats')}</FieldLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('buses.create.seatsPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SeatNumberOptions.map((v) => (
                      <SelectItem key={v} value={String(v)}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* LICENSE PLATE */}
          <Controller
            control={form.control}
            name="licensePlate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.licensePlate')}</FieldLabel>
                <Input {...field} placeholder={t('buses.create.plateNumberPlaceholder')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* RESERVATION TYPE */}
          <Controller
            control={form.control}
            name="seatReservationType"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('buses.details.reservationType')}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('buses.create.selectReservationType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusSeatPolicy.UNNUMBERED}>{t('buses.create.noSeatReservation')}</SelectItem>
                    <SelectItem value={BusSeatPolicy.NUMBERED}>{t('buses.create.seatReservation')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* STATUS */}
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.status')}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('agencies.create.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusStatus.ACTIVE}>{t('common.status.active')}</SelectItem>
                    <SelectItem value={BusStatus.INACTIVE}>{t('common.status.inactive')}</SelectItem>
                    <SelectItem value={BusStatus.MAINTENANCE}>{t('common.status.maintenance')}</SelectItem>
                    <SelectItem value={BusStatus.BREAKDOWN}>{t('common.status.breakdown')}</SelectItem>
                    <SelectItem value={BusStatus.OUT_OF_SERVICE}>{t('common.status.outOfService')}</SelectItem>
                    <SelectItem value={BusStatus.TO_REPLACE}>{t('common.status.toReplace')}</SelectItem>
                    <SelectItem value={BusStatus.DELETED}>{t('common.status.deleted')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('common.cancel')}</Button>
        </DialogClose>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!form.formState.isDirty || updateBus.isPending} type="button">
              {t('buses.edit.submit')}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm') || 'Confirm Update'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('common.confirmDescription') || 'Are you sure you want to update this bus?'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel type="button">{t('common.cancel')}</AlertDialogCancel>

              <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} type="button">
                {t('common.continue')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
