'use client';
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

export const UpdateTripStationsForm = ({
  control,
  errors,
  onStationsChangeAction,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
  onStationsChangeAction?: () => void;
}) => {
  const t = useTranslations('common');

  const stationSchema = z.object({
    cityId: z.string().min(1, t('forms.validation.cityRequired')),
    date: z.date().refine((val) => val !== undefined, t('forms.validation.dateRequired')),
    name: z.string(),
    price: z.string().min(1, t('forms.validation.priceRequired')),
    time: z.string().min(1, t('forms.validation.timeRequired')),
  });

  type StationFormValues = z.infer<typeof stationSchema>;
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
      const prevIndex = editingIndex === null ? fields.length - 1 : editingIndex - 1;
      if (prevIndex >= 0) {
        const lastStation = fields[prevIndex] as any;
        const lastStationDeparture = new Date(lastStation.departureTime || '');
        if (date.getTime() <= lastStationDeparture.getTime()) {
          stationForm.setError('date', { message: t('forms.validation.timeOrder') });
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
    if (onStationsChangeAction) {
      onStationsChangeAction();
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
    const station = fields[index] as any;
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

  const getCityOptions = () => {
    const fetchedCities = citiesData?.data.map((city: City) => ({ label: city.name, value: city.id })) || [];
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

  const removeStation = (index: number) => {
    remove(index);

    // Notify parent about the change
    if (onStationsChangeAction) {
      onStationsChangeAction();
    }
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
              <FieldLabel>{t('forms.stationName')}</FieldLabel>
              <Select
                emptyMessage={isLoadingCities ? t('loading') : t('empty.noData')}
                onSearchChangeAction={setCityQuery}
                onValueChangeAction={(val: string) => {
                  field.onChange(val);
                  const city = citiesData?.data.find((c: City) => c.id === val);
                  if (city) {
                    setValue('name', city.name);
                  }
                }}
                options={getCityOptions()}
                placeholder={t('forms.selectCity')}
                searchPlaceholder={t('forms.searchCity')}
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
              <FieldLabel>{t('forms.price')}</FieldLabel>
              <Input
                className="[&::-webkit-inner-spin-button]:appearance-none"
                {...field}
                placeholder={t('forms.enterPrice')}
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
                {t('table.date')}
              </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full justify-between font-normal text-sm"
                    data-invalid={fieldState.invalid}
                    variant="secondary"
                  >
                    {field.value ? field.value.toLocaleDateString() : t('table.date')}
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
              <FieldLabel>{t('forms.time')}</FieldLabel>
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
          <FieldLabel>{t('forms.actions')}</FieldLabel>
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

      {/* Station List */}
      {fields.length > 0 ? (
        <div className="space-y-2">
          <FieldLabel>
            {t('forms.stations')} ({fields.length})
          </FieldLabel>
          <div className="rounded-xl border-2 border-dashed p-6 text-center">
            {fields.map((field: any, index) => (
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
          <FieldLabel>{t('forms.stations')}</FieldLabel>
          <div className="rounded-xl border-2 border-dashed p-6 text-center">
            <p className="text-muted-foreground">{t('forms.noStations')}</p>
            <p className="mt-1 text-muted-foreground text-sm">{t('forms.addStationsHint')}</p>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {errors.stations && <p className="text-destructive text-sm">{errors.stations.message as string}</p>}
    </div>
  );
};
