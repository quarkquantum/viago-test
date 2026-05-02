import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@repo/design-system/web/src/components/ui/field';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select } from '@/components/select';
import { useGetTicket } from '@/features/tickets/api/use-get-ticket';
import { useUpdateTicket } from '@/features/tickets/api/use-update-ticket';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { formatCurrency } from '@/helpers/format-currency';

const TICKET_STATUS_OPTIONS = (t: (key: string) => string) => [
  { label: t('common.status.issued'), value: 'ISSUED' },
  { label: t('common.status.checkedIn'), value: 'CHECKED_IN' },
  { label: t('common.status.used'), value: 'USED' },
  { label: t('common.status.cancelled'), value: 'CANCELLED' },
  { label: t('common.status.expired'), value: 'EXPIRED' },
  { label: t('common.status.refunded'), value: 'REFUNDED' },
];

const formSchema = z.object({
  status: z.string().optional(),
  fromStation: z.string().optional(),
  toStation: z.string().optional(),
  seat: z.number().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

type UpdateTicketFormProps = {
  id: string;
  setOpen: (open: boolean) => void;
};

export const UpdateTicketForm = ({ id, setOpen }: UpdateTicketFormProps) => {
  const t = useTranslations();
  const updateTicket = useUpdateTicket({
    onSuccess: () => {
      setOpen(false);
    },
  });
  const { data: ticketData } = useGetTicket(id);
  const [total, setTotal] = useState(0);

  const ticket = ticketData?.data;
  const tripId = ticket?.booking?.trip?.id;

  const { data: tripData } = useGetTrip(tripId || '');

  const form = useForm<FormValues>({
    defaultValues: {
      status: ticket?.status || '',
      fromStation: ticket?.booking?.fromStation?.name || '',
      toStation: ticket?.booking?.toStation?.name || '',
      seat: ticket?.seat?.number || 0,
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = form;

  // Watch form values
  const fromStation = watch('fromStation');
  const toStation = watch('toStation');

  // Update form when ticket data loads
  useEffect(() => {
    if (ticket) {
      setValue('status', ticket.status);
      setValue('fromStation', ticket.booking.fromStation.name);
      setValue('toStation', ticket.booking.toStation.name);
      setValue('seat', ticket.seat.number);
    }
  }, [ticket, setValue]);

  // Station and seat options from trip
  const stations = tripData?.stations ?? [];
  const bus = tripData?.bus;
  const availableSeats = bus?.seats ?? [];

  const stationOptions = stations.map((s: { name: string }) => ({
    label: s.name,
    value: s.name,
  }));

  const selectedFromStation = stations.find((s: { name: string }) => s.name === fromStation);
  const selectedToStation = stations.find((s: { name: string }) => s.name === toStation);

  const toStationOptions = selectedFromStation
    ? stations
        .filter((s: { order: number }) => s.order > selectedFromStation.order)
        .map((s: { name: string }) => ({ label: s.name, value: s.name }))
    : [];

  const seatOptions = availableSeats.map((seat: { number: number }) => ({
    label: `${t('common.table.seat')} ${seat.number}`,
    value: seat.number.toString(),
  }));

  // Calculate total price when stations change
  useEffect(() => {
    if (selectedFromStation && selectedToStation) {
      const stationsInPath = stations.filter(
        (s: { order: number }) => s.order >= selectedFromStation.order && s.order < selectedToStation.order
      );
      setTotal(stationsInPath.reduce((sum: number, s: { startingPrice: number }) => sum + s.startingPrice, 0));
    } else {
      setTotal(ticket?.booking?.total || 0);
    }
  }, [selectedFromStation, selectedToStation, stations, ticket]);

  // Reset dependent fields
  useEffect(() => {
    if (!fromStation) {
      setValue('toStation', '');
    }
  }, [fromStation, setValue]);

  const onSubmit = (data: FormValues) => {
    const fromStationId = stations.find((s: { name: string; id: string }) => s.name === data.fromStation)?.id;
    const toStationId = stations.find((s: { name: string; id: string }) => s.name === data.toStation)?.id;
    const seatId = bus?.seats?.find((s: { number: number; id: string }) => s.number === data.seat)?.id;

    const updateData: Record<string, string | number | undefined> = {};

    if (data.status && data.status !== ticket?.status) {
      updateData.status = data.status;
    }

    if (fromStationId && fromStationId !== ticket?.booking?.fromStationId) {
      updateData.fromStationId = fromStationId;
    }

    if (toStationId && toStationId !== ticket?.booking?.toStationId) {
      updateData.toStationId = toStationId;
    }

    if (seatId && seatId !== ticket?.seatId) {
      updateData.seatId = seatId;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info(t('common.noChanges') || 'No changes to update');
      return;
    }

    updateTicket.mutate({
      identifier: id,
      json: updateData,
    });
  };

  if (!(ticket && tripData)) {
    return <div className="p-4 text-center text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          {/* Status */}
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('common.table.status')}</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  options={TICKET_STATUS_OPTIONS(t)}
                  placeholder={t('common.select.placeholder')}
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
                <FieldLabel>{t('common.table.from')}</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  options={stationOptions.slice(0, stationOptions.length - 1)}
                  placeholder={t('tickets.create.selectDeparture')}
                  searchPlaceholder={t('common.select.searchPlaceholder')}
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
                <FieldLabel>{t('common.table.to')}</FieldLabel>
                <Select
                  disabled={!fromStation}
                  onValueChange={field.onChange}
                  options={toStationOptions}
                  placeholder={
                    fromStation ? t('tickets.create.selectArrival') : t('tickets.create.selectDepartureFirst')
                  }
                  searchPlaceholder={t('common.select.searchPlaceholder')}
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
                <FieldLabel>{t('common.table.seatNumber')}</FieldLabel>
                <Select
                  disabled={availableSeats.length === 0}
                  onValueChange={(value) => field.onChange(Number.parseInt(value, 10))}
                  options={seatOptions}
                  placeholder={availableSeats.length > 0 ? t('tickets.create.selectSeat') : t('tickets.create.noSeats')}
                  searchPlaceholder={t('common.select.searchPlaceholder')}
                  value={field.value ? field.value.toString() : ''}
                />
                <p className="mt-1 text-muted-foreground text-sm">
                  {availableSeats.length === 1
                    ? t('tickets.create.seatAvailable')
                    : t('tickets.create.seatsAvailable', { count: availableSeats.length })}
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Price */}
          <Field className="flex flex-row justify-between">
            <FieldLabel>{t('common.table.price')}</FieldLabel>
            <p className="text-right font-semibold text-primary">{formatCurrency(total)}</p>
          </Field>
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="outline">{t('common.cancel')}</Button>
        </DialogClose>
        <Button disabled={!isDirty || updateTicket.isPending} type="submit">
          {updateTicket.isPending ? t('tickets.edit.updating') : t('tickets.edit.submit')}
        </Button>
      </DialogFooter>
    </form>
  );
};
