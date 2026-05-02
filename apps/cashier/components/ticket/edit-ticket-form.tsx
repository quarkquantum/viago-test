'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@repo/design-system/web/src/components/ui/field';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import z from 'zod';
import { Select } from '@/components/select';
import { useListPassengers } from '@/features/passengers/api/use-list-passengers';
import { useUpdateTicket } from '@/features/tickets/api/use-update-ticket';
import { useGetTripAvailableSeats } from '@/features/trips/api/use-get-trip-available-seats';
import { formatCurrency } from '@/helpers/format-currency';

type Station = {
  id: string;
  name: string;
  order: number;
  startingPrice: number;
};

type EditTicketFormProps = {
  ticketId: string;
  tripId: string;
  stations: Station[];
  defaultValues: {
    passengerEmail: string;
    fromStationName: string;
    toStationName: string;
    seatNumber: number;
    seatId: string;
  };
  setOpen: (open: boolean) => void;
};

type FormValues = {
  fromStation: string;
  passengerEmail: string;
  seat: number;
  toStation: string;
};

export const EditTicketForm = ({ ticketId, tripId, stations, defaultValues, setOpen }: EditTicketFormProps) => {
  const t = useTranslations('tickets');
  const updateTicket = useUpdateTicket(ticketId);
  const [passengerQuery, setPassengerQuery] = useState('');
  const [debouncedPassengerQuery, setDebouncedPassengerQuery] = useState('');

  useDebounce(() => setDebouncedPassengerQuery(passengerQuery), 300, [passengerQuery]);

  const { data: passengersList, isLoading: isLoadingPassengers } = useListPassengers(
    debouncedPassengerQuery ? { q: debouncedPassengerQuery } : {}
  );

  const passengers =
    passengersList?.data.map((p) => ({ label: p.email, value: p.email })) ?? [];

  const formSchema = useMemo(
    () =>
      z.object({
        fromStation: z.string().min(1, t('create.validation.fromRequired')),
        passengerEmail: z.string().email(t('create.validation.passengerRequired')),
        seat: z.number().min(1, t('create.validation.seatRequired')),
        toStation: z.string().min(1, t('create.validation.toRequired')),
      }),
    [t]
  );

  const form = useForm<FormValues>({
    defaultValues: {
      fromStation: defaultValues.fromStationName,
      passengerEmail: defaultValues.passengerEmail,
      seat: defaultValues.seatNumber,
      toStation: defaultValues.toStationName,
    },
    resolver: zodResolver(formSchema),
  });

  const sortedStations = useMemo(() => [...stations].sort((a, b) => a.order - b.order), [stations]);

  const fromStation = form.watch('fromStation');
  const toStation = form.watch('toStation');

  const selectedFrom = sortedStations.find((s) => s.name === fromStation);
  const selectedTo = sortedStations.find((s) => s.name === toStation);

  const { data: availableTripSeatsData } = useGetTripAvailableSeats(
    tripId,
    selectedFrom?.id && selectedTo?.id
      ? { fromStationId: selectedFrom.id, toStationId: selectedTo.id }
      : undefined
  );

  // Include current seat in the available options so it can be re-selected
  const apiSeats: { id: string; number: number }[] = availableTripSeatsData?.data ?? [];
  const currentSeatInList = apiSeats.some((s) => s.number === defaultValues.seatNumber);
  const availableSeats = currentSeatInList
    ? apiSeats
    : [...apiSeats, { id: defaultValues.seatId, number: defaultValues.seatNumber }];

  const seatOptions = availableSeats
    .sort((a, b) => a.number - b.number)
    .map((s) => ({ label: `${t('create.labels.seatNumber')} ${s.number}`, value: s.number.toString() }));

  const fromStationOptions = sortedStations.slice(0, sortedStations.length - 1).map((s) => ({ label: s.name, value: s.name }));
  const toStationOptions = selectedFrom
    ? sortedStations.filter((s) => s.order > selectedFrom.order).map((s) => ({ label: s.name, value: s.name }))
    : [];

  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (selectedFrom && selectedTo) {
      const inPath = sortedStations.filter((s) => s.order >= selectedFrom.order && s.order < selectedTo.order);
      setTotal(inPath.reduce((sum, s) => sum + s.startingPrice, 0));
    } else {
      setTotal(0);
    }
  }, [selectedFrom, selectedTo, sortedStations]);

  useEffect(() => {
    if (!fromStation) {
      form.setValue('toStation', '');
      form.setValue('seat', 0);
    }
  }, [fromStation, form]);

  useEffect(() => {
    if (!toStation) form.setValue('seat', 0);
  }, [toStation, form]);

  const onSubmit = (data: FormValues) => {
    const newFromStation = stations.find((s) => s.name === data.fromStation);
    const newToStation = stations.find((s) => s.name === data.toStation);
    const newSeat = availableSeats.find((s) => s.number === data.seat);

    if (!newFromStation || !newToStation || !newSeat) return;

    updateTicket.mutate(
      {
        fromStationId: newFromStation.id,
        passengerEmail: data.passengerEmail,
        seatId: newSeat.id,
        toStationId: newToStation.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="passengerEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('create.labels.passengerEmail')}</FieldLabel>
                <Select
                  emptyMessage={isLoadingPassengers ? t('create.messages.loading') : t('create.messages.noPassengerFound')}
                  onSearchChange={setPassengerQuery}
                  onValueChange={field.onChange}
                  options={passengers}
                  placeholder={t('create.placeholders.selectPassenger')}
                  searchPlaceholder={t('create.placeholders.searchPassenger')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="fromStation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('create.labels.from')}</FieldLabel>
                <Select
                  emptyMessage={t('create.messages.noStationFound')}
                  onValueChange={(v) => {
                    field.onChange(v);
                    if (v === toStation) form.setValue('toStation', '');
                  }}
                  options={fromStationOptions}
                  placeholder={t('create.placeholders.selectDeparture')}
                  searchPlaceholder={t('create.placeholders.searchStations')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="toStation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('create.labels.to')}</FieldLabel>
                <Select
                  disabled={!fromStation}
                  emptyMessage={t('create.messages.noStationFound')}
                  onValueChange={field.onChange}
                  options={toStationOptions}
                  placeholder={fromStation ? t('create.placeholders.selectArrival') : t('create.placeholders.selectDepartureFirst')}
                  searchPlaceholder={t('create.placeholders.searchStations')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="seat"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('create.labels.seatNumber')}</FieldLabel>
                <Select
                  disabled={!toStation}
                  emptyMessage={t('create.placeholders.noSeats')}
                  onValueChange={(v) => field.onChange(Number.parseInt(v, 10))}
                  options={seatOptions}
                  placeholder={
                    fromStation && toStation
                      ? t('create.placeholders.selectSeat')
                      : t('create.placeholders.selectStationsFirst')
                  }
                  searchPlaceholder={t('create.placeholders.searchSeats')}
                  value={field.value ? field.value.toString() : ''}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field className="flex flex-row justify-between">
            <FieldLabel>{t('create.labels.price')}</FieldLabel>
            <p className="text-right font-semibold text-primary">{formatCurrency(total)}</p>
          </Field>
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="secondary">{t('edit.cancel')}</Button>
        </DialogClose>
        <Button disabled={updateTicket.isPending} type="submit">
          {updateTicket.isPending ? t('edit.saving') : t('edit.save')}
        </Button>
      </DialogFooter>
    </form>
  );
};
