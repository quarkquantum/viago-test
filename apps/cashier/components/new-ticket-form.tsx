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
import { TripStatus } from '@repo/shared/constants';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import z from 'zod';
import { Select } from '@/components/select';
import { useListPassengers } from '@/features/passengers/api/use-list-passengers';
import { useCreateTicket } from '@/features/tickets/api/use-create-ticket';
import { useGetTripAvailableSeats } from '@/features/trips/api/use-get-trip-available-seats';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { formatCurrency } from '@/helpers/format-currency';

type FormValues = {
  fromStation: string;
  passengerEmail: string;
  seat: number;
  toStation: string;
};

type NewTicketFormProps = {
  trip: Trip;
  setOpen: (open: boolean) => void;
};

export const NewTicketForm = ({ trip, setOpen }: NewTicketFormProps) => {
  const t = useTranslations('tickets.create');
  const createTicket = useCreateTicket();
  const [passengerQuery, setPassengerQuery] = useState('');
  const [debouncedPassengerQuery, setDebouncedPassengerQuery] = useState('');

  // Debounce passenger search query
  useDebounce(
    () => {
      setDebouncedPassengerQuery(passengerQuery);
    },
    300,
    [passengerQuery]
  );

  const { data: passengersList, isLoading: isLoadingPassengers } = useListPassengers(
    debouncedPassengerQuery ? { q: debouncedPassengerQuery } : {}
  );

  const passengers =
    passengersList?.data.map((passenger) => ({
      label: passenger.email,
      value: passenger.email,
    })) ?? [];

  const [total, setTotal] = useState(0);
  const { stations } = trip;

  const formSchema = useMemo(
    () =>
      z.object({
        fromStation: z.string().min(1, t('validation.fromRequired')),
        passengerEmail: z.string().email(t('validation.passengerRequired')),
        seat: z.number().min(1, t('validation.seatRequired')),
        toStation: z.string().min(1, t('validation.toRequired')),
      }),
    [t]
  );

  const form = useForm<FormValues>({
    defaultValues: {
      fromStation: '',
      passengerEmail: '',
      seat: 0,
      toStation: '',
    },
    resolver: zodResolver(formSchema),
  });

  // Sort stations to ensure correct order
  const sortedStations = useMemo(() => [...stations].sort((a, b) => a.order - b.order), [stations]);

  // Watch form values for conditional enabling
  const passengerEmail = form.watch('passengerEmail');
  const fromStation = form.watch('fromStation');
  const toStation = form.watch('toStation');

  const selectedFrom = sortedStations.find((s) => s.name === fromStation);
  const selectedTo = sortedStations.find((s) => s.name === toStation);
  const selectedFromStationId = selectedFrom?.id;
  const selectedToStationId = selectedTo?.id;

  const { data: availableTripSeatsData } = useGetTripAvailableSeats(
    trip.id,
    selectedFromStationId && selectedToStationId
      ? {
          fromStationId: selectedFromStationId,
          toStationId: selectedToStationId,
        }
      : undefined
  );

  const availableSeats = availableTripSeatsData?.data ?? [];
  const seatOptions = availableSeats.map((seat: { number: number }) => ({
    label: `Seat ${seat.number}`,
    value: seat.number.toString(),
  }));

  const fromStationOptions = sortedStations.slice(0, sortedStations.length - 1).map((s) => ({
    label: s.name,
    value: s.name,
  }));

  const toStationOptions = selectedFrom
    ? sortedStations
        .filter((s) => s.order > selectedFrom.order)
        .map((s) => ({
          label: s.name,
          value: s.name,
        }))
    : [];

  // Calculate total price when stations are selected
  useEffect(() => {
    if (selectedFrom && selectedTo) {
      // Sum startingPrice of all segments between fromStation and toStation
      const stationsInPath = sortedStations.filter((s) => s.order >= selectedFrom.order && s.order < selectedTo.order);
      setTotal(stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0));
    } else {
      setTotal(0);
    }
  }, [selectedFrom, selectedTo, sortedStations]);

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (!passengerEmail) {
      form.setValue('fromStation', '');
      form.setValue('toStation', '');
      form.setValue('seat', 0);
    }
  }, [passengerEmail, form]);

  useEffect(() => {
    if (!fromStation) {
      form.setValue('toStation', '');
      form.setValue('seat', 0);
    }
  }, [fromStation, form]);

  useEffect(() => {
    if (!toStation) {
      form.setValue('seat', 0);
    }
  }, [toStation, form]);

  const onSubmit = (data: FormValues) => {
    const fromStationId = stations.find((s) => s.name === data.fromStation)?.id;
    const toStationId = stations.find((s) => s.name === data.toStation)?.id;
    const seatId = availableSeats.find((s: { number: number; id: string }) => s.number === data.seat)?.id;

    if (!(fromStationId && toStationId && seatId)) {
      return;
    }

    createTicket.mutate(
      {
        fromStationId,
        passengerEmail: data.passengerEmail,
        seatId,
        toStationId,
        tripId: trip.id,
      },
      {
        onError: () => {
          toast.error(t('messages.error'));
        },
        onSuccess: () => {
          toast.success(t('messages.success'));
          form.reset();
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
                <FieldLabel>{t('labels.passengerEmail')}</FieldLabel>
                <Select
                  emptyMessage={isLoadingPassengers ? t('messages.loading') : t('messages.noPassengerFound')}
                  onSearchChange={setPassengerQuery}
                  onValueChange={field.onChange}
                  options={passengers}
                  placeholder={t('placeholders.selectPassenger')}
                  searchPlaceholder={t('placeholders.searchPassenger')}
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
                <FieldLabel>{t('labels.from')}</FieldLabel>
                <Select
                  disabled={!passengerEmail}
                  emptyMessage={t('messages.noStationFound')}
                  onValueChange={field.onChange}
                  options={fromStationOptions}
                  placeholder={t('placeholders.selectDeparture')}
                  searchPlaceholder={t('placeholders.searchStations')}
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
                <FieldLabel>{t('labels.to')}</FieldLabel>
                <Select
                  disabled={!fromStation}
                  emptyMessage={t('messages.noStationFound')}
                  onValueChange={field.onChange}
                  options={toStationOptions}
                  placeholder={fromStation ? t('placeholders.selectArrival') : t('placeholders.selectDepartureFirst')}
                  searchPlaceholder={t('placeholders.searchStations')}
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
                <FieldLabel>{t('labels.seatNumber')}</FieldLabel>
                <Select
                  disabled={!toStation || availableSeats.length === 0}
                  emptyMessage={t('placeholders.noSeats')}
                  onValueChange={(value) => field.onChange(Number.parseInt(value, 10))}
                  options={seatOptions}
                  placeholder={
                    fromStation && toStation
                      ? availableSeats.length > 0
                        ? t('placeholders.selectSeat')
                        : t('placeholders.noSeats')
                      : t('placeholders.selectStationsFirst')
                  }
                  searchPlaceholder={t('placeholders.searchSeats')}
                  value={field.value ? field.value.toString() : ''}
                />
                {fromStation && toStation && (
                  <p className="mt-1 text-muted-foreground text-sm">
                    {t('messages.seatsAvailable', { count: availableSeats.length })}
                  </p>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Field className="flex flex-row justify-between">
            <FieldLabel>{t('labels.price')}</FieldLabel>
            <p className="text-right font-semibold text-primary">{formatCurrency(total)}</p>
          </Field>
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('dialog.cancel')}</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={
                availableSeats.length === 0 ||
                createTicket.isPending ||
                trip.status === TripStatus.DELETED ||
                trip.status === TripStatus.COMPLETED
              }
              type="button"
            >
              {createTicket.isPending ? t('dialog.creating') : t('dialog.submit')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('dialog.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => form.reset()} type="button">
                {t('dialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} type="button">
                {t('dialog.continue')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
