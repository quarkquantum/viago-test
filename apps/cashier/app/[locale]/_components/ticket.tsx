'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/web/src/components/ui/alert-dialog';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/web/src/components/ui/dialog';
import { HoldButton } from '@repo/design-system/web/src/components/ui/hold-button';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { Armchair, Building2, BusFront, Calendar, Clock, MapPin, Pencil, Printer, TicketIcon, User, User2Icon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Status } from '@/components/status';
import { EditTicketForm } from '@/components/ticket/edit-ticket-form';
import { TicketReceipt } from '@/components/ticket/ticket-receipt';
import { useDeleteTicket } from '@/features/tickets/api/use-delete-ticket';
import { useGetTicket } from '@/features/tickets/api/use-get-ticket';
import { useCancelTicket } from '@/features/tickets/api/use-cancel-ticket';
import { usePayTicket } from '@/features/tickets/api/use-pay-ticket';
import { useRefundTicket } from '@/features/tickets/api/use-refund-ticket';
import { formatCurrency } from '@/helpers/format-currency';
import { calculateRefund } from '@repo/shared/helpers';
import { Banknote } from 'lucide-react';

export const Ticket = () => {
  const t = useTranslations('tickets');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const ticket = params.ticket as string;
  const { data: ticketData, isLoading } = useGetTicket(ticket);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const deleteTicketMutation = useDeleteTicket(ticketData?.data?.id ?? '');
  const refundTicketMutation = useRefundTicket(ticketData?.data?.id ?? '');
  const cancelTicketMutation = useCancelTicket(ticketData?.data?.id ?? '');
  const payTicketMutation = usePayTicket(ticketData?.data?.id ?? '');

  const handleDelete = async () => {
    await deleteTicketMutation.mutateAsync(undefined);
    setOpen(false);
    router.push('/tickets');
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col justify-between gap-2 py-2 sm:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardHeader className="border-b">
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {['1', '2', '3', '4', '5'].map((id) => (
              <div className="flex flex-col gap-2" key={id}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex w-full flex-col justify-between gap-6 sm:flex-row">
          <Card className="w-full">
            <CardHeader className="border-b">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-32" />
              </div>
            </CardHeader>
            <CardContent className="flex h-full gap-4 p-6">
              <div className="flex w-fit min-w-37.5 flex-col gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex w-full flex-col gap-6">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
          <Card className="w-full md:w-fit xl:w-full">
            <CardHeader className="border-b">
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="flex h-full gap-4 p-6">
              <div className="flex w-fit min-w-37.5 flex-col gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex size-full flex-col gap-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (!ticketData || !ticketData.data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>{t('details.notFound.title')}</EmptyTitle>
            <EmptyDescription>{t('details.notFound.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('details.notFound.backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (!ticketData?.data?.booking) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>{t('details.incomplete.title')}</EmptyTitle>
            <EmptyDescription>{t('details.incomplete.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('details.notFound.backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const ticketInfo = ticketData?.data;
  if (!ticketInfo) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>{t('details.notFound.title')}</EmptyTitle>
            <EmptyDescription>{t('details.notFound.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('details.notFound.backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const {
    createdAt,
    seat,
    passenger,
    booking,
  } = ticketInfo;

  if (!booking) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>Booking data unavailable</EmptyTitle>
            <EmptyDescription>Please try again later.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('details.notFound.backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { total, trip, fromStation, toStation, agency, status: bookingStatus } = booking;

  const refundInfo = calculateRefund({
    amount: total,
    departureTime: fromStation?.departureTime,
  });

  const handleRefund = async () => {
    await refundTicketMutation.mutateAsync(undefined);
    setRefundOpen(false);
  };

  const handleCancel = async () => {
    await cancelTicketMutation.mutateAsync(undefined);
    setCancelOpen(false);
  };

  const handlePay = async () => {
    await payTicketMutation.mutateAsync(undefined);
    setPayOpen(false);
  };

  const now = new Date();
  const hasDeparted = new Date(fromStation.departureTime) < now;
  const hasArrived = new Date(toStation.departureTime) < now;
  const canRefundCancel = ticketData.data.status === 'ISSUED' && !hasDeparted;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 py-2 sm:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="gap-2 px-6" onClick={() => window.print()} variant="outline">
            <Printer className="size-4" />
            {t('details.printButton')}
          </Button>

          {/* Edit Dialog */}
          {ticketData.data.status === 'ISSUED' && (
            <Dialog onOpenChange={setEditOpen} open={editOpen}>
              <Button className="gap-2 px-6" onClick={() => setEditOpen(true)} variant="outline">
                <Pencil className="size-4" />
                {t('details.editButton')}
              </Button>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>{t('edit.title')}</DialogTitle>
                  <DialogDescription>{t('edit.description')}</DialogDescription>
                </DialogHeader>
                <EditTicketForm
                  defaultValues={{
                    fromStationName: fromStation.name,
                    passengerEmail: passenger.email,
                    seatId: seat.id,
                    seatNumber: seat.number,
                    toStationName: toStation.name,
                  }}
                  setOpen={setEditOpen}
                  stations={trip.stations}
                  ticketId={ticketData.data.id}
                  tripId={trip.id}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Refund Dialog */}
          {canRefundCancel && !hasArrived && (
            <AlertDialog onOpenChange={setRefundOpen} open={refundOpen}>
              <AlertDialogTrigger asChild>
                <Button className="px-6" variant="outline">
                  {t('details.refundButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('details.refundDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('details.refundDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2 rounded-lg border bg-muted/40 p-4 text-sm">
                  {refundInfo.refundable ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('details.refundDialog.originalAmount')}</span>
                        <span className="font-medium">{formatCurrency(total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('details.refundDialog.refundRate')}</span>
                        <span className="font-medium text-primary">{refundInfo.percentage}%</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between border-t pt-2">
                        <span className="font-semibold">{t('details.refundDialog.refundAmount')}</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(refundInfo.refundableAmount)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-destructive text-sm">{t('details.refundDialog.notRefundable')}</p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRefundOpen(false)}>{t('details.refundDialog.cancel')}</AlertDialogCancel>
                  {refundInfo.refundable && (
                    <HoldButton
                      disabled={refundTicketMutation.isPending}
                      holdDuration={2000}
                      onHoldComplete={handleRefund}
                      variant="default"
                    >
                      {refundTicketMutation.isPending
                        ? t('details.refundDialog.refunding')
                        : t('details.refundDialog.holdToRefund')}
                    </HoldButton>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Cancel Dialog */}
          {canRefundCancel && !hasArrived && (
            <AlertDialog onOpenChange={setCancelOpen} open={cancelOpen}>
              <AlertDialogTrigger asChild>
                <Button className="px-6" variant="outline">
                  {t('details.cancelButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('details.cancelDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('details.cancelDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelOpen(false)}>{t('details.cancelDialog.cancel')}</AlertDialogCancel>
                  <HoldButton
                    disabled={cancelTicketMutation.isPending}
                    holdDuration={2000}
                    onHoldComplete={handleCancel}
                    variant="destructive"
                  >
                    {cancelTicketMutation.isPending
                      ? t('details.cancelDialog.cancelling')
                      : t('details.cancelDialog.holdToCancel')}
                  </HoldButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Collect Payment Dialog */}
          {ticketData.data.status === 'RESERVED' && (
            <AlertDialog onOpenChange={setPayOpen} open={payOpen}>
              <AlertDialogTrigger asChild>
                <Button className="gap-2 px-6" variant="default">
                  <Banknote className="size-4" />
                  {t('details.payButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('details.payDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('details.payDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2 rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('details.payDialog.amount')}</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPayOpen(false)}>{t('details.payDialog.cancel')}</AlertDialogCancel>
                  <HoldButton
                    disabled={payTicketMutation.isPending}
                    holdDuration={2000}
                    onHoldComplete={handlePay}
                    variant="default"
                  >
                    {payTicketMutation.isPending
                      ? t('details.payDialog.collecting')
                      : t('details.payDialog.holdToCollect')}
                  </HoldButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Collect Payment Dialog */}
          {ticketData.data.status === 'RESERVED' && (
            <AlertDialog onOpenChange={setPayOpen} open={payOpen}>
              <AlertDialogTrigger asChild>
                <Button className="gap-2 px-6" variant="default">
                  <Banknote className="size-4" />
                  {t('details.payButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('details.payDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('details.payDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2 rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('details.payDialog.amount')}</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPayOpen(false)}>{t('details.payDialog.cancel')}</AlertDialogCancel>
                  <HoldButton
                    disabled={payTicketMutation.isPending}
                    holdDuration={2000}
                    onHoldComplete={handlePay}
                    variant="default"
                  >
                    {payTicketMutation.isPending
                      ? t('details.payDialog.collecting')
                      : t('details.payDialog.holdToCollect')}
                  </HoldButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Top Row: Trip & Journey Logic */}
      <Card className="fade-in animate-in duration-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <span className="font-semibold text-lg">{t('details.journeyInfo.title')}</span>
            </div>
            <Button asChild variant={'link'}>
              <Link href={`/trips/${trip.slug}`}>{t('details.journeyInfo.viewTrip')}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Route Timeline */}
          <div className="scrollbar-hide relative flex w-full flex-row gap-0 overflow-x-auto pb-4">
            <div className="flex min-w-full items-start px-2">
              {trip.stations.map((station: { id: string; name: string; departureTime: string }, index: number) => {
                const isFromStation = station.id === fromStation.id;
                const isToStation = station.id === toStation.id;
                const isFirst = index === 0;
                const isLast = index === trip.stations.length - 1;

                // Logic to check if this station is part of the journey segment
                const fromIndex = trip.stations.findIndex((s: { id: string }) => s.id === fromStation.id);
                const toIndex = trip.stations.findIndex((s: { id: string }) => s.id === toStation.id);
                const isPartOfJourney = index >= fromIndex && index <= toIndex;

                return (
                  <div className="flex min-w-60 flex-1 flex-col items-center" key={station.id}>
                    <div className="flex w-full items-center">
                      <div
                        className={`h-0.5 flex-1 ${isFirst ? 'bg-transparent' : isPartOfJourney && index > fromIndex ? 'bg-primary' : 'bg-border'}`}
                      />
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background ${
                          isFromStation || isToStation
                            ? 'border-primary ring-4 ring-primary/10'
                            : isPartOfJourney
                              ? 'border-primary/50'
                              : 'border-border'
                        }`}
                      >
                        <MapPin
                          className={`size-6 ${isFromStation || isToStation ? 'text-primary' : isPartOfJourney ? 'text-primary/70' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div
                        className={`h-0.5 flex-1 ${isLast ? 'bg-transparent' : isPartOfJourney && index < toIndex ? 'bg-primary' : 'bg-border'}`}
                      />
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-1.5 px-4 text-center">
                      <span
                        className={`font-bold ${isFromStation || isToStation ? 'text-primary text-xl' : 'text-foreground text-xl'}`}
                      >
                        {station.name}
                      </span>
                      <div className="flex flex-col items-center gap-1 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-4" />
                          {dayjs(station.departureTime).format('D MMM YYYY')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          {dayjs(station.departureTime).format('HH:mm')}
                        </span>
                      </div>
                      {(isFromStation || isToStation) && (
                        <Status className="mt-2 uppercase" status={isFromStation ? 'departure' : 'arrival'} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="my-8 h-px w-full bg-border" />

          {/* Operational Details */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.journeyInfo.driver')}</p>
                <p className="font-semibold text-base">{trip?.driver?.user?.fullName || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <BusFront className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.journeyInfo.bus')}</p>
                <p className="font-semibold text-base">{trip?.bus?.licensePlate || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.journeyInfo.agency')}</p>
                <p className="font-semibold text-base">{agency.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Booking Summary */}
        <Card className="fade-in animate-in duration-200">
          <CardHeader className="border-b py-3 md:py-4">
            <div className="flex items-center gap-2">
              <TicketIcon className="size-5 text-primary" />
              <span className="font-semibold text-lg">{t('details.summary.title')}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center justify-between rounded-lg border bg-muted/40 p-3 px-4">
                <span className="text-muted-foreground text-xs uppercase">{t('details.summary.status')}</span>
                <Status s={bookingStatus} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 px-4">
                <div className="flex items-center gap-2">
                  <Armchair className="size-5 text-primary" />
                  <span className="text-muted-foreground text-xs uppercase">{t('details.summary.seatNumber')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl">{seat.number}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-lg border bg-muted/40 p-3 px-4">
                <span className="text-muted-foreground text-xs uppercase">{t('details.summary.bookedOn')}</span>
                <span className="font-medium text-sm">{dayjs(createdAt).format('D MMM, HH:mm')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase">{t('details.summary.total')}</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-t pt-4">
              <QRCodeSVG
                bgColor="transparent"
                className="rounded-md"
                fgColor="currentColor"
                level="M"
                size={120}
                value={ticketData.data.key}
              />
              <span className="font-mono text-muted-foreground text-xs">{ticketData.data.key}</span>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Information */}
        <Card className="fade-in animate-in duration-200">
          <CardHeader className="border-b py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User2Icon className="size-5 text-primary" />
                <span className="font-semibold text-lg">{t('details.passenger.title')}</span>
              </div>
              <Button asChild size="sm" variant="link">
                <Link href={`/passenger/${passenger.id}`}>{t('details.passenger.viewProfile')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{passenger.fullName}</span>
                <span className="text-muted-foreground text-xs">{t('details.passenger.customer')}</span>
              </div>
            </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.passenger.email')}</span>
                  <span className="max-w-45 truncate text-right font-medium" title={passenger.email}>
                    {passenger.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.passenger.phone')}</span>
                  <span className="font-medium">{passenger.profile?.phoneNumber || 'N/A'}</span>
                </div>
                {passenger.profile?.identityDocumentType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.table.identityDocumentType')}</span>
                    <span className="font-medium">{passenger.profile.identityDocumentType}</span>
                  </div>
                )}
                {passenger.profile?.identityDocumentNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.table.identityDocumentNumber')}</span>
                    <span className="font-medium">{passenger.profile.identityDocumentNumber}</span>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden receipt for printing */}
      <TicketReceipt
        agency={agency.name}
        arrivalTime={toStation.departureTime}
        busLicensePlate={trip?.bus?.licensePlate || 'N/A'}
        busTitle={trip?.bus?.title || 'N/A'}
        createdAt={createdAt}
        departureTime={fromStation.departureTime}
        fromStation={fromStation.name}
        locale={locale}
        passengerName={passenger.fullName}
        passengerPhone={passenger.profile?.phoneNumber || 'N/A'}
        seatNumber={seat.number}
        ticketKey={ticketData.data.key}
        toStation={toStation.name}
        total={total}
        tripName={trip.name}
      />
    </div>
  );
};
