'use client';
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
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { Armchair, Calendar, CalendarCheck, Clock, MapPin, TicketIcon, User, User2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Status } from '@/components/status';
import { useGetBooking } from '@/features/bookings/api/use-get-booking';
import { formatCurrency } from '@/helpers/format-currency';

export const Booking = () => {
  const t = useTranslations('bookings');
  const tc = useTranslations('common');
  const params = useParams();
  const bookingId = params.booking as string;
  const { data: bookingData, isLoading } = useGetBooking(bookingId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex items-end justify-between gap-2 py-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="w-full lg:col-span-4">
            <CardHeader className="border-b">
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="grid grid-rows-1 gap-6 p-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                <div className="flex flex-col gap-1" key={`info-skel-${id}`}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex h-fit w-full flex-col gap-6 lg:col-span-8">
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4 p-6">
                {[1, 2].map((id) => (
                  <div className="flex flex-col gap-1" key={`pass-skel-${id}`}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4 p-6">
                {[1, 2, 3].map((id) => (
                  <div className="flex flex-col gap-1" key={`trip-skel-${id}`}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex flex-col">
                  {[1, 2, 3].map((id) => (
                    <div className="flex h-fit flex-col" key={`journ-skel-${id}`}>
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-12 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      {id < 3 && <div className="ml-5.5 h-8 w-0.5 bg-muted" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData?.data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarCheck />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/bookings">{t('details.empty.backToBookings')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const booking = bookingData.data;
  const stations = booking.trip?.stations ?? [];

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 py-2 sm:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
      </div>

      {/* Journey Card */}
      <Card className="fade-in animate-in duration-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <span className="font-semibold text-lg">{t('details.journey')}</span>
            </div>
            <Button asChild variant={'link'}>
              <Link href={`/trips/${booking.trip.id}`}>{t('details.viewTrip')}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex w-full items-center gap-4 overflow-x-auto">
          <div className="relative flex w-full flex-row gap-0 pb-4">
            <div className="flex min-w-full items-start px-2">
              {stations.map((station: { id: string; name: string; departureTime: string }, index: number) => {
                const isFirst = index === 0;
                const isLast = index === (stations.length ?? 0) - 1;

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
                <Status status={booking.status} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 px-4">
                <div className="flex items-center gap-2">
                  <Armchair className="size-5 text-primary" />
                  <span className="text-muted-foreground text-xs uppercase">{tc('table.seatNumber')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl">{booking.seat?.number || 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-lg border bg-muted/40 p-3 px-4">
                <span className="text-muted-foreground text-xs uppercase">{t('details.bookedOn')}</span>
                <span className="font-medium text-sm">{dayjs(booking.createdAt).format('D MMM, HH:mm')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase">{tc('table.total')}</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(booking.total)}</span>
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
                <Link href={`/passengers/${booking.passenger?.id}`}>{t('details.viewProfile')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{booking.passenger?.fullName}</span>
                <span className="text-muted-foreground text-xs">Customer</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc('table.email')}</span>
                <span className="max-w-45 truncate text-right font-medium" title={booking.passenger?.email}>
                  {booking.passenger?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc('table.phone')}</span>
                <span className="font-medium">{booking.passenger?.profile?.phoneNumber || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
