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
import { HoldButton } from '@repo/design-system/web/src/components/ui/hold-button';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { Armchair, Building2, BusFront, Calendar, Clock, MapPin, TicketIcon, User, User2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Status } from '@/components/status';
import { UpdateTicket } from '@/components/ticket/update-ticket';
import { useDeleteTicket } from '@/features/tickets/api/use-delete-ticket';
import { useGetTicket } from '@/features/tickets/api/use-get-ticket';
import { formatCurrency } from '@/helpers/format-currency';

export const Ticket = () => {
  const t = useTranslations('tickets');
  const tc = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const ticket = params.ticket as string;
  const { data: ticketData, isLoading } = useGetTicket(ticket);
  const [open, setOpen] = useState(false);
  const deleteTicketMutation = useDeleteTicket(ticketData?.data.id || '');

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
  if (!ticketData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>{t('notFound')}</EmptyTitle>
            <EmptyDescription>{t('notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const {
    id,
    createdAt,
    status: ticketStatus,
    seat,
    passenger,
    booking: { total, trip, agency },
  } = ticketData.data;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 py-2 sm:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <UpdateTicket id={id} />
          <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
            <AlertDialogTrigger asChild>
              <Button className="px-6" type="submit" variant={'destructive'}>
                {t('details.deleteTitle')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('details.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('details.deleteConfirmDescription')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>{tc('cancel')}</AlertDialogCancel>
                <HoldButton
                  disabled={deleteTicketMutation.isPending}
                  holdDuration={2000}
                  onHoldComplete={handleDelete}
                  variant="destructive"
                >
                  {deleteTicketMutation.isPending ? t('details.deleting') : t('details.holdToDelete')}
                </HoldButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Top Row: Trip & Journey Logic */}
      <Card className="fade-in animate-in duration-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <span className="font-semibold text-lg">{t('details.journeyInfo')}</span>
            </div>
            <Button asChild variant={'link'}>
              <Link href={`/trips/${trip.id}`}>{t('details.viewTrip')}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex w-full flex-col items-center gap-4">
          {/* Route Timeline */}
          <div className="relative flex w-full flex-row gap-0 overflow-x-auto pb-4">
            <div className="flex min-w-full items-start px-2">
              {trip?.stations.map((station: { id: string; name: string; departureTime: string }, index: number) => {
                const isFirst = index === 0;
                const isLast = index === (trip?.stations.length ?? 0) - 1;

                return (
                  <div className="flex min-w-60 flex-1 flex-col items-center" key={station.id}>
                    <div className="flex w-full items-center">
                      <div className={`h-0.5 flex-1 ${isFirst ? 'bg-transparent' : 'bg-primary'}`} />
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background ${
                          isFirst || isLast ? 'border-primary ring-4 ring-primary/10' : 'border-primary/50'
                        }`}
                      >
                        <MapPin className={`size-6 ${isFirst || isLast ? 'text-primary' : 'text-primary/70'}`} />
                      </div>
                      <div className={`h-0.5 flex-1 ${isLast ? 'bg-transparent' : 'bg-primary'}`} />
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-1.5 px-4 text-center">
                      <span
                        className={`font-semibold ${isFirst || isLast ? 'text-lg text-primary' : 'text-foreground text-lg'}`}
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
                      {(isFirst || isLast) && (
                        <Status className="mt-2 uppercase" status={isFirst ? 'departure' : 'arrival'} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="my-4 h-px w-full bg-border" />

          {/* Operational Details */}
          <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.driver')}</p>
                <Button asChild className="h-auto p-0 text-base" variant="link">
                  <Link href={`/drivers/${trip.driver.id}`}>{trip.driver?.user?.fullName || 'N/A'}</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <BusFront className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.bus')}</p>
                <Button asChild className="h-auto p-0 text-base" variant="link">
                  <Link href={`/buses/${trip.bus?.licensePlate}`}>{trip.bus?.licensePlate || 'N/A'}</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">{t('details.agency')}</p>
                <Button asChild className="h-auto p-0 text-base" variant="link">
                  <Link href={`/agencies/${agency.slug}`}>{agency.name}</Link>
                </Button>
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
              <span className="font-semibold text-lg">{t('details.bookingSummary')}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center justify-between rounded-lg border bg-muted/40 p-3 px-4">
                <span className="text-muted-foreground text-xs uppercase">{tc('table.status')}</span>
                <Status status={ticketStatus.toLowerCase()} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 px-4">
                <div className="flex items-center gap-2">
                  <Armchair className="size-5 text-primary" />
                  <span className="text-muted-foreground text-xs uppercase">{tc('table.seatNumber')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl">{seat.number}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-lg border bg-muted/40 p-3 px-4">
                <span className="text-muted-foreground text-xs uppercase">{t('details.bookedOn')}</span>
                <span className="font-medium text-sm">{dayjs(createdAt).format('D MMM, HH:mm')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase">{tc('table.total')}</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Information */}
        <Card className="fade-in animate-in duration-200">
          <CardHeader className="border-b py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User2Icon className="size-5 text-primary" />
                <span className="font-semibold text-lg">{tc('table.passenger')}</span>
              </div>
              <Button asChild size="sm" variant="link">
                <Link href={`/passengers/${passenger.id}`}>{t('details.viewProfile')}</Link>
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
                <span className="text-muted-foreground text-xs">Customer</span>
              </div>
            </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tc('table.email')}</span>
                  <span className="max-w-45 truncate text-right font-medium" title={passenger.email}>
                    {passenger.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tc('table.phone')}</span>
                  <span className="font-medium">{passenger.profile?.phoneNumber || 'N/A'}</span>
                </div>
                {passenger.profile?.identityDocumentType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tc('table.identityDocumentType')}</span>
                    <span className="font-medium">{passenger.profile.identityDocumentType}</span>
                  </div>
                )}
                {passenger.profile?.identityDocumentNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tc('table.identityDocumentNumber')}</span>
                    <span className="font-medium">{passenger.profile.identityDocumentNumber}</span>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
