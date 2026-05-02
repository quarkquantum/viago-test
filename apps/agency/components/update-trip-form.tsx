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
import { TripStatus } from '@repo/shared';
import { type _Translator, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select } from '@/components/select';
import { UpdateTripStationsForm } from '@/components/update-trip-stations-form';
import { useListBuses } from '@/features/buses/api/use-list-buses';
import { useListDrivers } from '@/features/drivers/api/use-list-drivers';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { useUpdateTrip } from '@/features/trips/api/use-update-trip';

const getFormSchema = (t: _Translator) =>
  z.object({
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
    status: z.string().min(1, t('forms.validation.statusRequired')),
  });

export type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export const UpdateTripForm = ({
  tripId,
  setOpenAction,
}: {
  tripId: string;
  setOpenAction: (open: boolean) => void;
}) => {
  const t = useTranslations('common');

  const formSchema = getFormSchema(t);

  const { data: tripData } = useGetTrip(tripId);
  const updateTrip = useUpdateTrip();

  const [busQuery, setBusQuery] = useState('');
  const [debouncedBusQuery, setDebouncedBusQuery] = useState('');

  const [driverQuery, setDriverQuery] = useState('');
  const [debouncedDriverQuery, setDebouncedDriverQuery] = useState('');

  useDebounce(
    () => {
      setDebouncedBusQuery(busQuery);
    },
    300,
    [busQuery]
  );

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
    driverList?.data.map((driver) => ({
      label: driver.user.email,
      value: driver.id,
    })) ?? [];
  const bus =
    busList?.data.map((bus) => ({
      label: bus.licensePlate,
      value: bus.id,
    })) ?? [];
  const statusList = [
    { label: t('status.active'), value: TripStatus.ONGOING },
    { label: t('status.completed'), value: TripStatus.COMPLETED },
    { label: t('status.deleted'), value: TripStatus.DELETED },
  ];
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

  const stations = useWatch({ control: form.control, name: 'stations' });
  const stationsCount = stations?.length || 0;

  const [stationsChanged, setStationsChanged] = useState(false);

  const handleStationsChange = () => {
    setStationsChanged(true);
  };

  const isFormChanged = form.formState.isDirty || stationsChanged;

  const onSubmit = (data: FormValues) => {
    const { busId, driverId, name, description, status, stations } = data;
    console.log('Submitting data:', data);
    stations.forEach((station, index) => {
      station.order = index;
    });
    updateTrip.mutate(
      {
        arrivalTime: stations.at(-1)?.departureTime || new Date().toISOString(),
        busId,
        departureTime: stations[0].departureTime,
        description,
        driverId,
        identifier: tripId,
        name,
        stations,
        status,
      },
      {
        onError: () => {
          toast.error(t('error'));
        },
        onSuccess: () => {
          toast.success(t('success'));
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
          <div className="grid grid-cols-3 gap-4">
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
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('status.label')}</FieldLabel>
                  <Select
                    onValueChangeAction={field.onChange}
                    options={statusList}
                    placeholder={t('forms.selectStatus')}
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
                <FieldLabel>{t('forms.description')}</FieldLabel>
                <Textarea placeholder={t('forms.enterDescription')} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>

        {/* Stations Component */}
        <FieldSet>
          <UpdateTripStationsForm control={control} errors={errors} onStationsChangeAction={handleStationsChange} />
        </FieldSet>
      </FieldGroup>

      {/* Form Actions */}
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('cancel')}</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!isFormChanged} type="button">
              {t('forms.updateTrip')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.updateTripTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.updateTripDescription', { count: stationsCount })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} type="button">
                {t('forms.updateTrip')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
