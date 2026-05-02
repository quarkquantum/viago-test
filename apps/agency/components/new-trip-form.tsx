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
import { Textarea } from '@repo/design-system/web/src/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { NewTripStationsForm } from '@/components/new-trip-stations-form';
import { Select } from '@/components/select';
import { useListBuses } from '@/features/buses/api/use-list-buses';
import { useListDrivers } from '@/features/drivers/api/use-list-drivers';
import { useCreateTrip } from '@/features/trips/api/use-create-trip';

export const NewTripForm = ({ setOpenAction }: { setOpenAction: (open: boolean) => void }) => {
  const t = useTranslations('common');

  const formSchema = z.object({
    busId: z.string().min(1, t('forms.validation.busRequired')),
    description: z.string().min(1, t('forms.validation.descriptionRequired')),
    driverId: z.string().min(1, t('forms.validation.driverRequired')),
    name: z.string().min(1, t('forms.validation.nameRequired')),
    stations: z
      .array(
        z.object({
          cityId: z.string().min(1, t('forms.validation.cityRequired')),
          departureTime: z.string().datetime(),
          name: z.string().min(1, t('forms.validation.stationNameRequired')),
          order: z.number().min(0),
          startingPrice: z.number().min(1, t('forms.validation.priceRequired')),
        })
      )
      .min(2, t('forms.validation.minStations', { count: 2 })),
  });

  type FormValues = z.infer<typeof formSchema>;

  const createTrip = useCreateTrip();

  const [busQuery, setBusQuery] = useState('');
  const [debouncedBusQuery, setDebouncedBusQuery] = useState('');

  const [driverQuery, setDriverQuery] = useState('');
  const [debouncedDriverQuery, setDebouncedDriverQuery] = useState('');

  // Debounce bus search query
  useDebounce(
    () => {
      setDebouncedBusQuery(busQuery);
    },
    300,
    [busQuery]
  );

  // Debounce driver search query
  useDebounce(
    () => {
      setDebouncedDriverQuery(driverQuery);
    },
    300,
    [driverQuery]
  );

  const { data: busList, isLoading: isLoadingBus } = useListBuses(debouncedBusQuery ? { q: debouncedBusQuery } : {});
  const { data: driverList, isLoading: isLoadingDriver } = useListDrivers(
    debouncedDriverQuery ? { q: debouncedDriverQuery } : {}
  );
  const drivers =
    driverList?.data.map((driver: { id: string; user: { email: string } }) => ({
      label: driver.user.email,
      value: driver.id,
    })) ?? [];
  const bus =
    busList?.data.map((bus: { id: string; licensePlate: string }) => ({
      label: bus.licensePlate,
      value: bus.id,
    })) ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
      busId: '',
      description: '',
      driverId: '',
      name: '',
      stations: [],
    },
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    formState: { errors, isValid },
  } = form;

  const stations = useWatch({ control: form.control, name: 'stations' });
  const stationsCount = stations?.length || 0;

  const onSubmit = (data: FormValues) => {
    const { busId, driverId, name, description, stations } = data;
    stations.forEach((station, index) => {
      station.order = index;
    });
    createTrip.mutate(
      {
        arrivalTime: stations.at(-1)?.departureTime || new Date().toISOString(),
        busId,
        departureTime: stations[0].departureTime,
        description,
        driverId,
        name,
        stations,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpenAction(false);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.tripName')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterTripName')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            {/* Driver Field */}
            <Controller
              control={control}
              name="driverId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('forms.driver')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingDriver ? t('loading') : t('empty.noData')}
                    onSearchChangeAction={setDriverQuery}
                    onValueChangeAction={field.onChange}
                    options={drivers}
                    placeholder={t('forms.selectDriver')}
                    searchPlaceholder={t('forms.searchDriver')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Bus Field */}
            <Controller
              control={control}
              name="busId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('forms.bus')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingBus ? t('loading') : t('empty.noData')}
                    onSearchChangeAction={setBusQuery}
                    onValueChangeAction={field.onChange}
                    options={bus}
                    placeholder={t('forms.selectBus')}
                    searchPlaceholder={t('forms.searchBus')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          {/* Description Field */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.description')}</FieldLabel>
                <Textarea placeholder={t('forms.enterDescription')} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>

        {/* Stations Component */}
        <FieldSet>
          <NewTripStationsForm control={control} errors={errors} />
        </FieldSet>
      </FieldGroup>

      {/* Form Actions */}
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('cancel')}</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!isValid || stationsCount < 2} type="button">
              {t('forms.createTrip')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.createTripTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.createTripDescription', { count: stationsCount })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">{t('cancel')}</AlertDialogCancel>
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
