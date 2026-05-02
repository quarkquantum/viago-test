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
import { Bus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SeatMap } from '@/components/trip/seat-map';
import { Status } from '@/components/status';
import { TripBookings } from '@/components/trip/trip-bookings';
import { useGetTrip } from '@/features/trips/api/use-get-trip';

export const Trip = () => {
  const t = useTranslations('trips');
  const params = useParams();
  const trip = params.trip as string;
  const { data: tripData, isLoading, refetch } = useGetTrip(trip);

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
        <div className="flex flex-col gap-6 sm:flex-row">
          <Card className="w-1/2">
            <CardHeader className="border-b">
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="grid grid-rows-1 gap-6 p-6">
              {['1', '2', '3', '4', '5', '6', '7'].map((id) => (
                <div className="flex flex-col gap-1" key={id}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex h-fit w-full flex-col gap-6">
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Skeleton className="h-8 w-32" />
                <div className="flex flex-col">
                  {[1, 2, 3, 4].map((id) => (
                    <div className="flex h-fit flex-col" key={id}>
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
            <Card className="h-fit w-full rounded-2xl shadow">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Skeleton className="h-8 w-32" />
                <div className="rounded-md border p-4">
                  <div className="mb-4 flex gap-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => (
                      <Skeleton className="h-4 w-full" key={id} />
                    ))}
                  </div>
                  {['1', '2', '3', '4', '5'].map((id) => (
                    <div className="mb-2 flex gap-4" key={id}>
                      <Skeleton className="h-8 w-full" />
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

  if (!tripData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bus />
            </EmptyMedia>
            <EmptyTitle>{t('common.empty.noTrips')}</EmptyTitle>
            <EmptyDescription>{t('details.notFound.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/trips">{t('details.notFound.backToTrips')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-end justify-between gap-2 py-2">
        <div className="flex flex-col gap-2">
          <h1 className="truncate font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
      </div>

      {/* Top Row: Trip Info Horizontal Card */}
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase">{t('details.info.tripName')}</span>
            <span className="font-medium text-lg">{tripData?.name}</span>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase">{t('details.info.bus')}</span>
            <span className="font-medium text-base">{tripData?.bus.licensePlate}</span>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase">{t('details.info.date')}</span>
            <span className="font-medium text-sm">{dayjs(tripData?.createdAt).format('D MMM YYYY, HH:mm')}</span>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase">{t('details.info.status')}</span>
            <Status s={tripData?.status} />
          </div>
        </CardContent>
      </Card>

      {/* Middle Row: Stations (Horizontal Scrollable Cards) */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="font-semibold text-lg">{t('details.stationsRoute.title')}</h2>
        </CardHeader>
        <CardContent className="flex w-full items-center gap-4 overflow-x-auto">
          <div className="relative flex w-full flex-row gap-0 pb-4">
            <div className="flex min-w-full items-start px-2">
              {tripData?.stations.map((station, index: number) => {
                const isFirst = index === 0;
                const isLast = index === (tripData?.stations.length ?? 0) - 1;

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
                      {station.seatsSummary?.segmentToStationName ? (
                        <div className="mt-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                          <div className="flex items-center justify-center gap-1 font-medium text-foreground">
                            <Users className="size-3.5" />
                            <span>
                              {t('details.stationsRoute.availableSeats')}: {station.seatsSummary.available}/
                              {station.seatsSummary.total}
                            </span>
                          </div>
                          <div className="mt-0.5 text-muted-foreground">
                            {t('details.stationsRoute.reservedSeats')}: {station.seatsSummary.reserved}{' '}
                            {t('details.stationsRoute.to')} {station.seatsSummary.segmentToStationName}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
                          {t('details.stationsRoute.terminalStation')}
                        </div>
                      )}
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

      {/* Seat Availability Map */}
      <SeatMap
        allSeats={tripData?.bus?.seats || []}
        stations={tripData?.stations || []}
        totalSeats={tripData?.bus?.maxPlaces ?? 0}
        tripId={tripData?.id}
      />

      {/* Bottom Row: Tickets */}
      <div className="w-full">
        <TripBookings bookings={tripData?.bookings || []} refetch={refetch} />
      </div>
    </div>
  );
};
