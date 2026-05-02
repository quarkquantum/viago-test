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
import { Switch } from '@repo/design-system/web/src/components/ui/switch';
import { TripStatus } from '@repo/shared/constants';
import { Banknote, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useListPassengers } from '@/features/passengers/api/use-list-passengers';
import { useCreateTicket } from '@/features/tickets/api/use-create-ticket';
import { useGetTripAvailableSeats } from '@/features/trips/api/use-get-trip-available-seats';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';
import { formatCurrency } from '@/helpers/format-currency';

const formSchema = z.object({
  passengerEmail: z.string().email('Email address is required.'),
  agencyId: z.string().min(1, 'Agency is required.'),
  tripId: z.string().min(1, 'Trip is required.'),
  fromStation: z.string().min(1, 'From station is required.'),
  toStation: z.string().min(1, 'To station is required.'),
  seat: z.number().min(1, 'Seat is required.'),
  isPaid: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

type NewTicketFormProps = {
  setOpen: (open: boolean) => void;
};

export const NewTicketForm = ({ setOpen }: NewTicketFormProps) => {
  const t = useTranslations('common');
  const createTicket = useCreateTicket({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });
  const [passengerQuery, setPassengerQuery] = useState('');
  const [debouncedPassengerQuery, setDebouncedPassengerQuery] = useState('');
  const [agencyQuery, setAgencyQuery] = useState('');
  const [debouncedAgencyQuery, setDebouncedAgencyQuery] = useState('');
  const [tripQuery, setTripQuery] = useState('');
  const [debouncedTripQuery, setDebouncedTripQuery] = useState('');
  const [total, setTotal] = useState(0);

  // Debounce search queries
  useDebounce(
    () => {
      setDebouncedPassengerQuery(passengerQuery);
    },
    300,
    [passengerQuery]
  );

  useDebounce(
    () => {
      setDebouncedAgencyQuery(agencyQuery);
    },
    300,
    [agencyQuery]
  );

  useDebounce(
    () => {
      setDebouncedTripQuery(tripQuery);
    },
    300,
    [tripQuery]
  );

  const form = useForm<FormValues>({
    defaultValues: {
      passengerEmail: '',
      agencyId: '',
      tripId: '',
      fromStation: '',
      toStation: '',
      seat: 0,
      isPaid: true,
    },
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, watch, setValue } = form;

  // Watch form values
  const passengerEmail = watch('passengerEmail');
  const agencyId = watch('agencyId');
  const tripId = watch('tripId');
  const fromStation = watch('fromStation');
  const toStation = watch('toStation');

  // Fetch data
  const { data: passengersList, isLoading: isLoadingPassengers } = useListPassengers(
    debouncedPassengerQuery ? { q: debouncedPassengerQuery } : {}
  );

  const { data: agenciesList, isLoading: isLoadingAgencies } = useListAgencies({
    q: debouncedAgencyQuery || undefined,
  });

  const { data: tripsList, isLoading: isLoadingTrips } = useListTripsRoutes(
    agencyId ? { agencyId, name: debouncedTripQuery || undefined } : {}
  );

  const { data: tripData } = useGetTrip(tripId);

  // Options
  const passengers =
    passengersList?.data.map((passenger: { email: string }) => ({
      label: passenger.email,
      value: passenger.email,
    })) ?? [];

  const agencies =
    agenciesList?.data?.map((agency: { name: string; slug: string }) => ({
      label: agency.name,
      value: agency.slug,
    })) ?? [];

  const trips =
    tripsList?.data.map((trip: { name: string; id: string }) => ({
      label: trip.name,
      value: trip.id,
    })) ?? [];

  // Station and seat options from selected trip
  const stations = tripData?.stations ?? [];

  // Sort stations to ensure correct order
  const sortedStations = useMemo(
    () => [...stations].sort((a: { order: number }, b: { order: number }) => a.order - b.order),
    [stations]
  );

  const fromStationOptions = sortedStations.slice(0, sortedStations.length - 1).map((s: { name: string }) => ({
    label: s.name,
    value: s.name,
  }));

  const selectedFromStation = sortedStations.find((s: { name: string }) => s.name === fromStation);
  const selectedToStation = sortedStations.find((s: { name: string }) => s.name === toStation);
  const selectedFromStationId = selectedFromStation?.id as string | undefined;
  const selectedToStationId = selectedToStation?.id as string | undefined;

  const { data: availableTripSeatsData } = useGetTripAvailableSeats(
    tripId,
    selectedFromStationId && selectedToStationId
      ? {
          fromStationId: selectedFromStationId,
          toStationId: selectedToStationId,
        }
      : undefined
  );

  const toStationOptions = selectedFromStation
    ? sortedStations
        .filter((s) => s.order > selectedFromStation.order)
        .map((s: { name: string }) => ({
          label: s.name,
          value: s.name,
        }))
    : [];

  const availableSeats = availableTripSeatsData?.data ?? [];

  const seatOptions = availableSeats.map((seat: { number: number }) => ({
    label: `Seat ${seat.number}`,
    value: seat.number.toString(),
  }));

  // Calculate total price when stations are selected
  useEffect(() => {
    if (selectedFromStation && selectedToStation) {
      // Sum startingPrice of all segments between fromStation and toStation
      const stationsInPath = sortedStations.filter(
        (s) => s.order >= selectedFromStation.order && s.order < selectedToStation.order
      );
      setTotal(stationsInPath.reduce((sum: number, s: { startingPrice: number }) => sum + s.startingPrice, 0));
    } else {
      setTotal(0);
    }
  }, [selectedFromStation, selectedToStation, sortedStations]);

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (!passengerEmail) {
      setValue('agencyId', '');
      setValue('tripId', '');
      setValue('fromStation', '');
      setValue('toStation', '');
      setValue('seat', 0);
    }
  }, [passengerEmail, setValue]);

  useEffect(() => {
    if (!agencyId) {
      setValue('tripId', '');
      setValue('fromStation', '');
      setValue('toStation', '');
      setValue('seat', 0);
    }
  }, [agencyId, setValue]);

  useEffect(() => {
    if (!tripId) {
      setValue('fromStation', '');
      setValue('toStation', '');
      setValue('seat', 0);
    }
  }, [tripId, setValue]);

  useEffect(() => {
    if (!fromStation) {
      setValue('toStation', '');
      setValue('seat', 0);
    }
  }, [fromStation, setValue]);

  useEffect(() => {
    if (!toStation) {
      setValue('seat', 0);
    }
  }, [toStation, setValue]);

  const onSubmit = (data: FormValues) => {
    const fromStationId = stations.find((s: { name: string; id: string }) => s.name === data.fromStation)?.id;
    const toStationId = stations.find((s: { name: string; id: string }) => s.name === data.toStation)?.id;
    const seatId = availableSeats.find((s: { number: number; id: string }) => s.number === data.seat)?.id;

    if (!(fromStationId && toStationId && seatId)) {
      toast.error(t('toast.invalidSelection'));
      return;
    }

    createTicket.mutate({
      fromStationId,
      passengerEmail: data.passengerEmail,
      seatId,
      toStationId,
      tripId: data.tripId,
      isPaid: data.isPaid,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          {/* Passenger Email */}
          <Controller
            control={control}
            name="passengerEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.passengerEmail')}</FieldLabel>
                <Select
                  emptyMessage={isLoadingPassengers ? t('loading') : t('forms.noPassengerFound')}
                  onSearchChange={setPassengerQuery}
                  onValueChange={field.onChange}
                  options={passengers}
                  placeholder={t('forms.selectPassenger')}
                  searchPlaceholder={t('forms.searchPassenger')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Agency */}
          <Controller
            control={control}
            name="agencyId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('table.agency')}</FieldLabel>
                <Select
                  disabled={!passengerEmail}
                  emptyMessage={isLoadingAgencies ? t('loading') : t('forms.noAgencyFound')}
                  onSearchChange={setAgencyQuery}
                  onValueChange={field.onChange}
                  options={agencies}
                  placeholder={passengerEmail ? t('forms.selectAgency') : t('forms.selectPassengerFirst')}
                  searchPlaceholder={t('forms.searchAgencies')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Trip */}
          <Controller
            control={control}
            name="tripId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('table.trip')}</FieldLabel>
                <Select
                  disabled={!agencyId}
                  emptyMessage={isLoadingTrips ? t('loading') : t('forms.noTripsFound')}
                  onSearchChange={setTripQuery}
                  onValueChange={field.onChange}
                  options={trips}
                  placeholder={agencyId ? t('forms.selectTrip') : t('forms.selectAgencyFirst')}
                  searchPlaceholder={t('forms.searchTrips')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* From Station */}
          <Controller
            control={control}
            name="fromStation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('table.from')}</FieldLabel>
                <Select
                  disabled={!(tripId && tripData)}
                  emptyMessage={t('forms.noStationFound')}
                  onValueChange={field.onChange}
                  options={fromStationOptions}
                  placeholder={tripId ? t('forms.selectDeparture') : t('forms.selectTripFirst')}
                  searchPlaceholder={t('forms.searchStations')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* To Station */}
          <Controller
            control={control}
            name="toStation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('table.to')}</FieldLabel>
                <Select
                  disabled={!fromStation}
                  emptyMessage={t('forms.noStationFound')}
                  onValueChange={field.onChange}
                  options={toStationOptions}
                  placeholder={fromStation ? t('forms.selectArrival') : t('forms.selectDepartureFirst')}
                  searchPlaceholder={t('forms.searchStations')}
                  value={field.value}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Seat */}
          <Controller
            control={control}
            name="seat"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  {t('table.seat')} {t('table.action')}
                </FieldLabel>
                <Select
                  disabled={!toStation || availableSeats.length === 0}
                  emptyMessage={t('forms.noSeatsAvailable')}
                  onValueChange={(value) => field.onChange(Number.parseInt(value, 10))}
                  options={seatOptions}
                  placeholder={
                    fromStation && toStation
                      ? availableSeats.length > 0
                        ? t('forms.selectSeat')
                        : t('forms.noSeatsAvailable')
                      : t('forms.selectStationsFirst')
                  }
                  searchPlaceholder={t('forms.searchSeats')}
                  value={field.value ? field.value.toString() : ''}
                />
                {fromStation && toStation && (
                  <p className="mt-1 text-muted-foreground text-sm">
                    {availableSeats.length === 1
                      ? t('forms.seatsAvailable', { count: availableSeats.length })
                      : t('forms.seatsAvailable_plural', { count: availableSeats.length })}
                  </p>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Price */}
          <Field className="flex flex-row justify-between">
            <FieldLabel>{t('table.price')}</FieldLabel>
            <p className="text-right font-semibold text-primary">{formatCurrency(total)}</p>
          </Field>

          {/* Payment Type */}
          <Controller
            control={control}
            name="isPaid"
            render={({ field }) => (
              <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="flex flex-col gap-1">
                  <FieldLabel className="flex items-center gap-2">
                    {field.value ? <Banknote className="size-4" /> : <Ticket className="size-4" />}
                    {field.value ? t('forms.quickSale') : t('forms.createReservation')}
                  </FieldLabel>
                  <p className="text-muted-foreground text-xs">
                    {field.value ? t('forms.quickSaleDescription') : t('forms.createReservationDescription')}
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="secondary">{t('cancel')}</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={
                availableSeats.length === 0 ||
                createTicket.isPending ||
                tripData?.status === TripStatus.DELETED ||
                tripData?.status === TripStatus.COMPLETED
              }
              type="button"
            >
              {createTicket.isPending
                ? t('forms.creating')
                : watch('isPaid')
                  ? t('forms.quickSale')
                  : t('forms.createReservation')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {watch('isPaid') ? t('dialogs.confirmQuickSale') : t('dialogs.confirmCreateReservation')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => form.reset()} type="button">
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleSubmit(onSubmit)()} type="button">
                {t('dialogs.continue')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </form>
  );
};
