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
import { ArrowRight, Bus, CalendarCheck, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Status } from '@/components/status';
import { useGetBooking } from '@/features/bookings/api/use-get-booking';
import { formatCurrency } from '@/helpers/format-currency';

export const Booking = () => {
  const t = useTranslations('bookings');
  const tc = useTranslations('common');
  const params = useParams();
  const _router = useRouter();
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
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="w-full lg:w-1/3">
            <CardHeader className="border-b">
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="grid grid-rows-1 gap-6 p-6">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => (
                <div className="flex flex-col gap-1" key={id}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex h-fit w-full flex-col gap-6">
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4 p-6">
                {['1', '2'].map((id) => (
                  <div className="flex flex-col gap-1" key={id}>
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
                {['1', '2', '3'].map((id) => (
                  <div className="flex flex-col gap-1" key={id}>
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
                  {['1', '2', '3'].map((id) => (
                    <div className="flex h-fit flex-col" key={id}>
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-12 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      {(id as unknown as number) < 2 && <div className="ml-5.5 h-8 w-0.5 bg-muted" />}
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
            <EmptyTitle>{t('list.notFound')}</EmptyTitle>
            <EmptyDescription>{t('list.notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/bookings">{t('list.backToBookings')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const booking = bookingData.data;
  const stations = booking.trip?.stations ?? [];
  const fromIndex = stations.findIndex((s: { id: string }) => s.id === booking.fromStation?.id);
  const toIndex = stations.findIndex((s: { id: string }) => s.id === booking.toStation?.id);

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-end justify-between gap-2 py-2">
        <div className="flex flex-col gap-2">
          <h1 className="truncate font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Booking Info Card */}
        <Card className="w-full lg:w-1/3">
          <CardHeader className="border-b font-semibold text-lg">{t('details.bookingInfo')}</CardHeader>
          <CardContent className="grid grid-rows-1 gap-6 p-6">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.status')}</p>
              <Status s={booking.status} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.total')}</p>
              <p className="font-bold text-lg text-primary">{formatCurrency(booking.total)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.seatNumber')}</p>
              <span className="font-semibold">{booking.seat?.number ?? 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.owner')}</p>
              <p className="font-semibold text-sm">{booking.agency?.name}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.createdAt')}</p>
              <p className="font-semibold text-sm">{dayjs(booking.createdAt).format('ddd, D MMM YYYY HH:mm')}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">{tc('table.updatedAt')}</p>
              <p className="font-semibold text-sm">{dayjs(booking.updatedAt).format('ddd, D MMM YYYY HH:mm')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex h-fit w-full flex-col gap-6">
          {/* Passenger Info Card */}
          <Card className="h-fit w-full rounded-2xl shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b font-semibold text-lg">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                <span>{t('details.passengerDetails')}</span>
              </div>
              <Button asChild size="sm" variant="link">
                <Link href={`/passengers/${booking.passenger?.id}`}>{t('details.viewPassenger')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{tc('table.fullName')}</p>
                <p className="font-semibold text-base">{booking.passenger?.fullName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{tc('table.email')}</p>
                <p className="text-sm">{booking.passenger?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Trip Info Card */}
          <Card className="h-fit w-full rounded-2xl shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b font-semibold text-lg">
              <div className="flex items-center gap-2">
                <Bus className="size-5 text-primary" />
                <span>{t('details.tripDetails')}</span>
              </div>
              <Button asChild size="sm" variant="link">
                <Link href={`/trips/${booking.trip?.id}`}>{t('details.viewTrip')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{tc('table.tripName')}</p>
                <p className="font-semibold text-base">{booking.trip?.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{tc('table.licensePlate')}</p>
                <p className="text-sm">{booking.trip?.bus?.licensePlate}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{t('details.schedule')}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>{dayjs(booking.trip?.departureTime).format('ddd, D MMM YYYY HH:mm')}</span>
                  <ArrowRight className="size-4" />
                  <span>{dayjs(booking.trip?.arrivalTime).format('ddd, D MMM YYYY HH:mm')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey Card */}
          <Card className="h-fit w-full rounded-2xl shadow">
            <CardHeader className="flex flex-row items-center gap-2 border-b font-semibold text-lg">
              <MapPin className="size-5 text-primary" />
              {t('details.journey')}
            </CardHeader>
            <CardContent className="fade-in flex h-full animate-in flex-col gap-0 p-6 duration-200">
              {stations.map((station: { id: string; name: string; departureTime: string }, index: number) => {
                const isFrom = station.id === booking.fromStation?.id;
                const isTo = station.id === booking.toStation?.id;
                const isHighlight = index >= fromIndex && index <= toIndex;
                const isLast = index === stations.length - 1;
                const isStationIcon = isFrom || isTo;

                return (
                  <div className="flex gap-4" key={station.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`z-10 flex size-8 items-center justify-center rounded-full border-2 bg-background transition-colors ${
                          isHighlight ? 'border-primary' : 'border-muted'
                        }`}
                      >
                        {isStationIcon ? (
                          <MapPin className={`size-4 ${isHighlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        ) : (
                          <div
                            className={`size-2.5 rounded-full transition-colors ${
                              isHighlight ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`-my-px h-10 w-0.5 transition-colors ${
                            index >= fromIndex && index < toIndex ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                    <div className={`flex flex-col pb-6 ${!isHighlight && 'opacity-50'}`}>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold text-sm ${isHighlight ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {station.name}
                        </p>
                        {isFrom && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary uppercase tracking-wider">
                            {tc('table.departure')}
                          </span>
                        )}
                        {isTo && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary uppercase tracking-wider">
                            {tc('table.arrival')}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {dayjs(station.departureTime).format('ddd, D MMM HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
