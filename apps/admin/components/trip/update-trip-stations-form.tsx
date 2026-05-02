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
import { ChevronDownIcon, Edit, Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { Select } from '@/components/select';
import { StationItem } from '@/components/station-item';
import type { City } from '@/features/cities/api/use-list-cities';
import { useListCities } from '@/features/cities/api/use-list-cities';
import type { FormValues } from './update-trip-form'; // Or define the type locally

type StationInputProps = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  onStationsChange?: () => void; // New prop
};

const stationSchema = z.object({
  cityId: z.string().min(1, 'City is required'),
  date: z.date({ message: 'Date is required' }),
  name: z.string(),
  price: z.string().min(1, 'Price is required'),
  time: z.string().min(1, 'Time is required'),
});

type StationFormValues = z.infer<typeof stationSchema>;

export const UpdateTripStationsForm = ({ control, errors, onStationsChange }: StationInputProps) => {
  const t = useTranslations();
  const { fields, append, remove, update } = useFieldArray({
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

  const watchedCityId = useWatch({ control: stationControl, name: 'cityId' });
  const watchedName = useWatch({ control: stationControl, name: 'name' });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const onSubmit = (data: StationFormValues) => {
    const date = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);

    // Check time ordering
    if (fields.length > 0) {
      // If editing, skip comparing to self (logic slightly complex if reordering allowed, but assuming replace in place)
      // Actually simpler: compare to previous station.
      // If editing index 0, compare with nothing.
      // If adding (index = length), compare with index-1.

      const prevIndex = editingIndex === null ? fields.length - 1 : editingIndex - 1;
      if (prevIndex >= 0) {
        const lastStation = fields[prevIndex];
        const lastStationDeparture = new Date(lastStation.departureTime);
        if (date.getTime() <= lastStationDeparture.getTime()) {
          stationForm.setError('date', { message: 'Departure time must be after the previous station.' });
          return;
        }
      }
    }

    const stationPayload = {
      cityId: data.cityId,
      departureTime: date.toISOString(),
      name: data.name,
      order: 0,
      startingPrice: Number.parseFloat(data.price),
    };

    if (editingIndex !== null) {
      update(editingIndex, stationPayload);
      setEditingIndex(null);
    } else {
      append(stationPayload);
    }

    // Notify parent about the change
    if (onStationsChange) {
      onStationsChange();
    }

    reset({
      cityId: '',
      date: undefined,
      name: '',
      price: '',
      time: '00:00',
    });
  };

  const selectStation = (index: number) => {
    const station = fields[index];
    const date = new Date(station.departureTime);
    reset({
      cityId: station.cityId,
      date,
      name: station.name,
      price: station.startingPrice.toString(),
      time: date.toTimeString().slice(0, 5),
    });
    setEditingIndex(index);
  };

  const removeStation = (index: number) => {
    remove(index);

    // Notify parent about the change
    if (onStationsChange) {
      onStationsChange();
    }
  };

  const getCityOptions = () => {
    const fetchedCities = citiesData?.data?.map((city: City) => ({ label: city.name, value: city.id })) || [];
    let allOptions = fetchedCities;

    // If editing and we have a cityId, ensure it's in the list
    if (editingIndex !== null && watchedCityId) {
      const exists = fetchedCities.some((c: { value: string }) => c.value === watchedCityId);
      if (!exists && watchedName) {
        allOptions = [...fetchedCities, { label: watchedName, value: watchedCityId }];
      }
    }

    // Deduplicate options based on value
    const uniqueOptions = allOptions.filter(
      (option: { value: string }, index: number, self: { value: string }[]) =>
        index === self.findIndex((t) => t.value === option.value)
    );

    return uniqueOptions;
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
                options={getCityOptions()}
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
            {editingIndex === null ? <Plus className="size-4" /> : <Edit className="size-4" />}
          </Button>
        </Field>
      </div>
      {/* Validation Error (general) is now handled via Controller or individual fields mostly, but if we have form-wide errors like logic: */}
      {/* We are using stationForm.setError('date') for logic error, so it will appear under date field. Removed general validationError state */}

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
                    onClick={() => selectStation(index)}
                    size="icon-sm"
                    type="button"
                    variant="secondary"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    className="size-8 shrink-0"
                    onClick={() => removeStation(index)}
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
