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
import { Textarea } from '@repo/design-system/web/src/components/ui/textarea';
import { createTripAdminSchema } from '@repo/validators';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import type { z } from 'zod';
import { Select } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useListCities } from '@/features/cities/api/use-list-cities';
import { useCreateTrip } from '@/features/trips/api/use-create-trip';
import { useTranslations } from 'next-intl';

export type FormValues = z.infer<typeof createTripAdminSchema>;

export const NewTripForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const createTrip = useCreateTrip({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const [agencyQuery, setAgencyQuery] = useState('');
  const [debouncedAgencyQuery, setDebouncedAgencyQuery] = useState('');

  const [cityQuery, setCityQuery] = useState('');
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('');

  useDebounce(() => setDebouncedAgencyQuery(agencyQuery), 300, [agencyQuery]);
  useDebounce(() => setDebouncedCityQuery(cityQuery), 300, [cityQuery]);

  const form = useForm<FormValues>({
    defaultValues: {
      agencyId: '',
      departureCityId: '',
      arrivalCityId: '',
      description: '',
    },
    resolver: zodResolver(createTripAdminSchema),
  });

  const { data: agencyList, isLoading: isLoadingAgency } = useListAgencies(
    debouncedAgencyQuery ? { q: debouncedAgencyQuery } : {}
  );

  const { data: cityList, isLoading: isLoadingCities } = useListCities(
    debouncedCityQuery ? { q: debouncedCityQuery } : {}
  );

  const agencies =
    agencyList?.data?.map((agency: { id: string; name: string }) => ({
      label: agency.name,
      value: agency.id,
    })) ?? [];

  const cities =
    cityList?.data?.map((city: { id: string; name: string }) => ({
      label: city.name,
      value: city.id,
    })) ?? [];

  const onSubmit = (data: FormValues) => {
    createTrip.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          {/* Agency */}
          <Controller
            control={form.control}
            name="agencyId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.agency')}</FieldLabel>
                <Select
                  emptyMessage={isLoadingAgency ? t('common.loading') : t('common.select.emptyMessage')}
                  onSearchChange={setAgencyQuery}
                  onValueChange={field.onChange}
                  options={agencies}
                  placeholder={t('trips.create.selectAgency')}
                  searchPlaceholder={t('trips.create.searchAgency')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Departure City */}
            <Controller
              control={form.control}
              name="departureCityId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('trips.create.departureCity')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingCities ? t('common.loading') : t('common.select.emptyMessage')}
                    onSearchChange={setCityQuery}
                    onValueChange={field.onChange}
                    options={cities}
                    placeholder={t('trips.create.selectDepartureCity')}
                    searchPlaceholder={t('trips.create.searchCity')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Arrival City */}
            <Controller
              control={form.control}
              name="arrivalCityId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('trips.create.arrivalCity')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingCities ? t('common.loading') : t('common.select.emptyMessage')}
                    onSearchChange={setCityQuery}
                    onValueChange={field.onChange}
                    options={cities}
                    placeholder={t('trips.create.selectArrivalCity')}
                    searchPlaceholder={t('trips.create.searchCity')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          {/* Description */}
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.description')}</FieldLabel>
                <Textarea
                  placeholder={t('trips.create.tripDescriptionPlaceholder')}
                  {...field}
                  value={field.value ?? ''}
                />
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
            <Button disabled={!form.formState.isValid || createTrip.isPending} type="button">
              {t('trips.create.submit')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('common.confirmDescription')}</AlertDialogDescription>
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
