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
import { TripStatus } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { Select } from '@/components/select';
import { UpdateTripStationsForm } from '@/components/trip/update-trip-stations-form';
import { useListBuses } from '@/features/buses/api/use-list-buses';
import { useListDrivers } from '@/features/drivers/api/use-list-drivers';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { useUpdateTrip } from '@/features/trips/api/use-update-trip';

const formSchema = z.object({
  busId: z.string().min(1, 'Bus is required.'),
  description: z.string().min(1, 'Description is required.'),
  driverId: z.string().min(1, 'Driver is required.'),
  name: z.string().min(1, 'Name is required.'),
  stations: z
    .array(
      z.object({
        cityId: z.string().min(1, 'City is required.'),
        departureTime: z.string().datetime(),
        name: z.string().min(1, 'Station name is required.'),
        order: z.number().min(0),
        startingPrice: z.number().min(0, 'Price is required.'),
      })
    )
    .min(2, 'At least 2 stations are required.'),
  status: z.string().min(1, 'Status is required.'),
});

export type FormValues = z.infer<typeof formSchema>;

export const UpdateTripForm = ({ tripId, setOpen }: { tripId: string; setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const { data: tripData } = useGetTrip(tripId);
  const updateTrip = useUpdateTrip({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

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

  const { data: busList, isLoading: isLoadingBus } = useListBuses(
    tripData?.agencyId
      ? { agencyId: tripData.agencyId, ...(debouncedBusQuery ? { q: debouncedBusQuery } : {}) }
      : undefined
  );
  const { data: driverList, isLoading: isLoadingDriver } = useListDrivers(
    tripData?.agencyId
      ? { agencyId: tripData.agencyId, ...(debouncedDriverQuery ? { q: debouncedDriverQuery } : {}) }
      : undefined
  );

  const drivers =
    driverList?.data?.map((driver: { id: string; user: { email: string } }) => ({
      label: driver.user.email,
      value: driver.id,
    })) ?? [];

  const bus =
    busList?.data?.map((bus: { id: string; licensePlate: string }) => ({
      label: bus.licensePlate,
      value: bus.id,
    })) ?? [];

  const statusList = Object.values(TripStatus).map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    value: status,
  }));

  const form = useForm<FormValues>({
    defaultValues: {
      busId: tripData?.busId || '',
      description: tripData?.description || '',
      driverId: tripData?.driverId || '',
      name: tripData?.name || '',
      stations: tripData?.stations || [],
      status: (tripData?.status as TripStatus) || TripStatus.PENDING,
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (tripData) {
      form.reset({
        busId: tripData.busId,
        description: tripData.description || '',
        driverId: tripData.driverId,
        name: tripData.name,
        stations: tripData.stations.map(
          (s: {
            cityId: string;
            departureTime: string | number | Date;
            name: string;
            order: number;
            startingPrice: number;
          }) => ({
            cityId: s.cityId,
            departureTime: new Date(s.departureTime).toISOString(),
            name: s.name,
            order: s.order,
            startingPrice: s.startingPrice,
          })
        ),
        status: tripData.status as TripStatus,
      });
    }
  }, [tripData, form.reset]);

  const stations = useWatch({ control: form.control, name: 'stations' });
  const stationsCount = stations?.length || 0;

  const [stationsChanged, setStationsChanged] = useState(false);

  const handleStationsChange = () => {
    setStationsChanged(true);
  };

  const isFormChanged = form.formState.isDirty || stationsChanged;

  const onSubmit = (data: FormValues) => {
    const { busId, driverId, name, description, status, stations } = data;
    stations.forEach((station, index) => {
      station.order = index;
    });
    updateTrip.mutate({
      arrivalTime: stations.at(-1)?.departureTime || '',
      busId,
      departureTime: stations[0]?.departureTime || '',
      description,
      driverId,
      identifier: tripId,
      name,
      stations,
      status,
    });
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
                <FieldLabel>{t('common.table.name')}</FieldLabel>
                <Input {...field} placeholder={t('trips.create.tripNamePlaceholder')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div className="grid grid-cols-3 gap-4">
            {/* Driver Field */}
            <Controller
              control={control}
              name="driverId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('common.table.driver')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingDriver ? t('common.loading') : t('common.select.emptyMessage')}
                    onSearchChange={setDriverQuery}
                    onValueChange={field.onChange}
                    options={drivers}
                    placeholder={t('trips.create.selectDriver')}
                    searchPlaceholder={t('trips.create.searchDriver')}
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
                  <FieldLabel>{t('common.table.trip')}</FieldLabel>
                  <Select
                    emptyMessage={isLoadingBus ? t('common.loading') : t('common.select.emptyMessage')}
                    onSearchChange={setBusQuery}
                    onValueChange={field.onChange}
                    options={bus}
                    placeholder={t('trips.create.selectBus')}
                    searchPlaceholder={t('trips.create.searchBus')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('common.table.status')}</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    options={statusList}
                    placeholder={t('common.select.placeholder')}
                    value={field.value}
                    withSearch={false}
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
                <FieldLabel>{t('common.table.description')}</FieldLabel>
                <Textarea placeholder={t('trips.create.tripDescriptionPlaceholder')} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>

        {/* Stations Component */}
        <FieldSet>
          <UpdateTripStationsForm control={control} errors={errors} onStationsChange={handleStationsChange} />
        </FieldSet>
      </FieldGroup>

      {/* Form Actions */}
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('common.cancel')}</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!isFormChanged} type="button">
              {t('trips.edit.submit')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm') || 'Update Trip?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('trips.edit.confirmDescription', { count: stationsCount }) ||
                  `Are you sure you want to update this trip with ${stationsCount} stations?`}
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
