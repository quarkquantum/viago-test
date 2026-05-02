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
import { BusSeatPolicy } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateBus } from '@/features/buses/api/use-create-bus';

export const NewBusForm = ({ setOpenAction }: { setOpenAction: (open: boolean) => void }) => {
  const t = useTranslations('common');

  const formSchema = z.object({
    licensePlate: z.string().min(1, t('forms.validation.licensePlateRequired')),
    nbrOfSeats: z.number().min(8, t('forms.validation.minSeats', { count: 8 })),
    seatReservationType: z.enum([BusSeatPolicy.UNNUMBERED, BusSeatPolicy.NUMBERED]),
    title: z.string().min(1, t('forms.validation.titleRequired')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const createBus = useCreateBus({
    onSuccess: () => {
      form.reset();
      setOpenAction(false);
    },
  });
  const form = useForm<FormValues>({
    defaultValues: {
      licensePlate: '',
      nbrOfSeats: 69,
      seatReservationType: BusSeatPolicy.UNNUMBERED,
      title: '',
    },
    resolver: zodResolver(formSchema),
  });
  const SeatNumberOptions = [25, 30, 36, 45, 55, 60, 69];
  const onSubmit = (data: FormValues) => {
    const { title, licensePlate, nbrOfSeats, seatReservationType } = data;
    createBus.mutate({
      licensePlate,
      maxPlaces: nbrOfSeats,
      seatReservationType,
      title,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
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

          <Controller
            control={form.control}
            name="nbrOfSeats"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.nbrOfSeats')}</FieldLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? field.value.toString() : ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.selectSeats')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SeatNumberOptions.map((seats) => (
                      <SelectItem key={seats} value={seats.toString()}>
                        {seats}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

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
                    <SelectItem value="UNNUMBERED">{t('forms.noSeatOrder')}</SelectItem>
                    <SelectItem value="NUMBERED">{t('forms.seatReservation')}</SelectItem>
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
            <Button type="button">{t('forms.createBus')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>{t('dialogs.createBusDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => form.reset()} type="button">
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} type="button">
                {t('dialogs.confirmCreate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
