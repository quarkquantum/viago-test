// Components/station-input.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Calendar } from '@repo/design-system/web/src/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@repo/design-system/web/src/components/ui/dropdown-menu';
import { Field, FieldError, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { ChevronDownIcon, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { Select } from '@/components/select';
import { StationItem } from '@/components/station-item';
import type { City } from '@/features/cities/api/use-list-cities';
import { useListCities } from '@/features/cities/api/use-list-cities';
import type { FormValues } from './new-trip-form'; // Or define the type locally

type StationInputProps = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
};

const stationSchema = z.object({
  cityId: z.string().min(1, 'City is required'),
  date: z.date({ message: 'Date is required' }),
  name: z.string(),
  price: z.string().min(1, 'Price is required'),
  time: z.string().min(1, 'Time is required'),
});

type StationFormValues = z.infer<typeof stationSchema>;

import { useTranslations } from 'next-intl';

export const TripStationsForm = ({ control, errors }: StationInputProps) => {
  const t = useTranslations();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stations',
  });

  const [cityQuery, setCityQuery] = useState('');
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('');

  useDebounce(
    () => {
      setDebouncedCityQuery(cityQuery);
    },
    300,
    [cityQuery]
  );

  const { data: citiesData, isLoading: isLoadingCities } = useListCities(
    debouncedCityQuery ? { q: debouncedCityQuery } : {}
  );

  const stationForm = useForm<StationFormValues>({
    defaultValues: {
      cityId: '',
      price: '',
      time: '00:00',
      name: '',
    },
    resolver: zodResolver(stationSchema),
  });

  const {
    control: stationControl,
    handleSubmit,
    setValue,
    reset,
    formState: { isValid: isStationValid },
  } = stationForm;

  const onSubmit = (data: StationFormValues) => {
    const date = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);

    // Check time ordering
    if (fields.length > 0) {
      const lastStation = fields.at(-1);
      const lastStationDeparture = new Date(lastStation?.departureTime || '');
      if (date.getTime() <= lastStationDeparture.getTime()) {
        stationForm.setError('date', { message: 'Departure time must be after the previous station.' });
        return;
      }
    }

    append({
      cityId: data.cityId,
      departureTime: date.toISOString(),
      name: data.name,
      order: 0,
      startingPrice: Number.parseFloat(data.price),
    });

    reset({
      cityId: '',
      date: undefined,
      name: '',
      price: '',
      time: '00:00',
    });
  };

  return (
    <div className="space-y-4">
      {/* Station Input Fields */}
      <div className="grid grid-flow-col gap-4">
        <Controller
          control={stationControl}
          name="cityId"
          render={({ field, fieldState }) => (
            <Field className="flex-1" data-invalid={fieldState.invalid}>
              <FieldLabel>{t('trips.create.stationName')}</FieldLabel>
              <Select
                emptyMessage={isLoadingCities ? t('common.loading') : t('common.select.emptyMessage')}
                onSearchChange={setCityQuery}
                onValueChange={(val) => {
                  field.onChange(val);
                  const city = citiesData?.data?.find((c: City) => c.id === val);
                  if (city) {
                    setValue('name', city.name);
                  }
                }}
                options={citiesData?.data?.map((city: City) => ({ label: city.name, value: city.id })) || []}
                placeholder={t('trips.create.selectCity')}
                searchPlaceholder={t('trips.create.searchCity')}
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={stationControl}
          name="price"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('trips.create.price')}</FieldLabel>
              <Input
                className="[&::-webkit-inner-spin-button]:appearance-none"
                {...field}
                placeholder={t('trips.create.enterPrice')}
                type="number"
              />
            </Field>
          )}
        />
        <Controller
          control={stationControl}
          name="date"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="px-1" htmlFor="date-picker">
                {t('common.table.date')}
              </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full justify-between font-normal text-sm"
                    data-invalid={fieldState.invalid}
                    variant="secondary"
                  >
                    {field.value ? field.value.toLocaleDateString() : t('trips.create.selectDate')}
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto p-0">
                  <Calendar mode="single" onSelect={field.onChange} selected={field.value} />
                </DropdownMenuContent>
              </DropdownMenu>
              {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={stationControl}
          name="time"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('trips.create.time')}</FieldLabel>
              <Input
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...field}
                step="60"
                type="time"
              />
            </Field>
          )}
        />
        <Field>
          <FieldLabel>{t('trips.create.action')}</FieldLabel>
          <Button
            className="size-9 self-center"
            disabled={!isStationValid}
            onClick={handleSubmit(onSubmit)}
            size="icon-sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-4" />
          </Button>
        </Field>
      </div>

      {/* Station List */}
      {fields.length > 0 ? (
        <div className="space-y-2">
          <FieldLabel>
            {t('trips.create.stations')} ({fields.length})
          </FieldLabel>
          <div className="rounded-xl border-2 border-dashed p-6 text-center">
            {fields.map((field, index) => (
              <div className="flex flex-col" key={field.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <StationItem
                      arrival={index === fields.length - 1 && fields.length > 1}
                      departure={index === 0}
                      station={{
                        departureTime: field.departureTime,
                        name: field.name,
                        startingPrice: field.startingPrice,
                      }}
                    />
                  </div>
                  <Button
                    className="size-8 shrink-0"
                    onClick={() => remove(index)}
                    size="icon-sm"
                    type="button"
                    variant="secondary"
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
                {index !== fields.length - 1 && <div className="ml-5.5 h-5 w-0.5 bg-muted" />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <FieldLabel>{t('trips.create.stations')}</FieldLabel>
          <div className="rounded-xl border-2 border-dashed p-6 text-center">
            <p className="text-muted-foreground">{t('trips.create.noStations')}</p>
            <p className="mt-1 text-muted-foreground text-sm">{t('trips.create.addMinStations')}</p>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {errors.stations && <p className="text-destructive text-sm">{errors.stations.message}</p>}
    </div>
  );
};
