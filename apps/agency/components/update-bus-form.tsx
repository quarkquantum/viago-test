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
import { BusSeatNumberOptions, BusSeatPolicy, BusStatus } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { useGetBus } from '@/features/buses/api/use-get-bus';
import { useUpdateBus } from '@/features/buses/api/use-update-bus';

export const UpdateBusForm = ({ busId, setOpenAction }: { busId: string; setOpenAction: (open: boolean) => void }) => {
  const t = useTranslations('common');

  const formSchema = z.object({
    licensePlate: z.string().min(1, t('forms.validation.licensePlateRequired')),
    nbrOfSeats: z.number().min(5, t('forms.validation.minSeats', { count: 5 })),
    seatReservationType: z.enum(BusSeatPolicy),
    status: z.enum(BusStatus),
    title: z.string().min(1, t('forms.validation.titleRequired')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const updateBus = useUpdateBus({
    onSuccess: () => {
      form.reset();
      setOpenAction(false);
    },
  });
  const { data: bus, isLoading } = useGetBus(busId);

  const form = useForm<FormValues>({
    defaultValues: {
      licensePlate: bus?.data?.bus?.licensePlate,
      nbrOfSeats: bus?.data?.bus?.maxPlaces,
      seatReservationType: bus?.data?.bus?.seatReservationType as BusSeatPolicy,
      status: bus?.data?.bus?.status as BusStatus,
      title: bus?.data?.bus?.title,
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: FormValues) => {
    updateBus.mutate({
      identifier: busId,
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
                <FieldLabel>{t('forms.title')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterTitle')} />
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
                <FieldLabel>{t('forms.nbrOfSeats')}</FieldLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.selectSeats')} />
                  </SelectTrigger>
                  <SelectContent>
                    {BusSeatNumberOptions.map((v) => (
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
                <FieldLabel>{t('forms.licensePlate')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterLicensePlate')} />
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
                <FieldLabel>{t('forms.seatReservationType')}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.selectReservationType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusSeatPolicy.UNNUMBERED}>{t('forms.noSeatOrder')}</SelectItem>
                    <SelectItem value={BusSeatPolicy.NUMBERED}>{t('forms.seatReservation')}</SelectItem>
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
                <FieldLabel>{t('status.label')}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('status.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusStatus.ACTIVE}>{t('status.active')}</SelectItem>
                    <SelectItem value={BusStatus.INACTIVE}>{t('status.inactive')}</SelectItem>
                    <SelectItem value={BusStatus.MAINTENANCE}>{t('status.maintenance')}</SelectItem>
                    <SelectItem value={BusStatus.BREAKDOWN}>{t('status.breakdown')}</SelectItem>
                    <SelectItem value={BusStatus.OUT_OF_SERVICE}>{t('status.outOfService')}</SelectItem>
                    <SelectItem value={BusStatus.TO_REPLACE}>{t('status.toReplace')}</SelectItem>
                    <SelectItem value={BusStatus.DELETED}>{t('status.deleted')}</SelectItem>
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
          <Button variant="secondary">{t('cancel')}</Button>
        </DialogClose>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button">{t('forms.updateBus')}</Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.confirmUpdate')}</AlertDialogTitle>
              <AlertDialogDescription>{t('dialogs.updateBusDescription')}</AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel type="button">{t('cancel')}</AlertDialogCancel>

              <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} type="button">
                {t('dialogs.confirmUpdate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
