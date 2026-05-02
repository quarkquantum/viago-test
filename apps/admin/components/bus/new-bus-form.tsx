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
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { Select as SelectComponent } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useCreateBus } from '@/features/buses/api/use-create-bus';

const formSchema = z.object({
  agencyId: z.string().min(1, 'Agency is required.'),
  licensePlate: z.string().min(1, 'License plate is required.'),
  nbrOfSeats: z.number().min(8, 'Number of seats must be at least 5.'),
  seatReservationType: z.enum([BusSeatPolicy.UNNUMBERED, BusSeatPolicy.NUMBERED]),
  title: z.string().min(1, 'Title is required.'),
});

type FormValues = z.infer<typeof formSchema>;

import { useTranslations } from 'next-intl';

export const NewBusForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const createBus = useCreateBus({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });
  const [agencyQuery, setAgencyQuery] = useState('');
  const [debouncedAgencyQuery, setDebouncedAgencyQuery] = useState('');

  // Debounce agency search query
  useDebounce(
    () => {
      setDebouncedAgencyQuery(agencyQuery);
    },
    300,
    [agencyQuery]
  );
  const { data: agencyList, isLoading: isLoadingAgency } = useListAgencies(
    debouncedAgencyQuery ? { q: debouncedAgencyQuery } : {}
  );

  const agencies =
    agencyList?.data?.map((agency: { name: string; id: string }) => ({
      label: agency.name,
      value: agency.id,
    })) ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
      agencyId: '',
      licensePlate: '',
      nbrOfSeats: 69,
      seatReservationType: BusSeatPolicy.UNNUMBERED,
      title: '',
    },
    resolver: zodResolver(formSchema),
  });
  const SeatNumberOptions = [25, 30, 36, 45, 55, 60, 69];
  const onSubmit = (data: FormValues) => {
    const { agencyId, title, licensePlate, nbrOfSeats, seatReservationType } = data;
    createBus.mutate({
      agencyId,
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
            name="agencyId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.agency')}</FieldLabel>
                <SelectComponent
                  emptyMessage={isLoadingAgency ? t('common.loading') : t('agencies.list.empty.title')}
                  onSearchChange={setAgencyQuery}
                  onValueChange={field.onChange}
                  options={agencies}
                  placeholder={t('buses.create.selectAgency')}
                  searchPlaceholder={t('buses.create.searchAgency')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
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

          <Controller
            control={form.control}
            name="nbrOfSeats"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.seats')}</FieldLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? field.value.toString() : ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('buses.create.seatsPlaceholder')} />
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
                <FieldLabel>{t('common.table.licensePlate')}</FieldLabel>
                <Input {...field} placeholder={t('buses.create.plateNumberPlaceholder')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
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
                    <SelectItem value="UNNUMBERED">{t('buses.create.noSeatReservation')}</SelectItem>
                    <SelectItem value="NUMBERED">{t('buses.create.seatReservation')}</SelectItem>
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
            <Button disabled={!form.formState.isValid || createBus.isPending} type="button">
              {t('buses.create.submit')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm') || 'Are you absolutely sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('common.confirmDescription') || 'Are you sure you want to perform this action?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => form.reset()} type="button">
                {t('common.cancel')}
              </AlertDialogCancel>
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
