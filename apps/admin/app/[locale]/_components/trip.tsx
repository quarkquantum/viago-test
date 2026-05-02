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
import { ArrowRight, Bus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Status } from '@/components/status';
import { TripStationCard } from '@/components/trip/trip-station-card';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { formatCurrency } from '@/helpers/format-currency';

export const Trip = () => {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const params = useParams();
  const trip = params.trip as string;
  const { data: tripData, isLoading } = useGetTrip(trip);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="flex flex-col gap-1" key={i}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="flex items-center gap-4 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-32 w-55" key={i} />
            ))}
          </CardContent>
        </Card>
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
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/trips">{t('list.backToTrips')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const stations = tripData.stations ?? [];
  const prices = stations.map((s) => s.startingPrice).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-end justify-between gap-2 py-2">
        <div className="flex flex-col gap-2">
          <h1 className="truncate font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/trips">{t('list.backToTrips')}</Link>
        </Button>
      </div>

      {/* Trip Info */}
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('table.tripName')}</span>
            <span className="font-medium text-lg">{tripData.name}</span>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          <div className="flex flex-col gap-1">
            <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('table.agency')}</span>
            <Button asChild className="h-auto w-fit p-0 font-medium text-base" variant="link">
              <Link href={`/agencies/${tripData.agency.slug}`}>{tripData.agency.name}</Link>
            </Button>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          {tripData.driver && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('table.driver')}</span>
                <Button asChild className="h-auto w-fit p-0 font-medium text-base" variant="link">
                  <Link href={`/drivers/${tripData.driver.id}`}>{tripData.driver.user.fullName}</Link>
                </Button>
              </div>
              <div className="hidden h-10 w-px bg-border lg:block" />
            </>
          )}

          {tripData.bus && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('table.bus')}</span>
                <Button asChild className="h-auto w-fit p-0 font-medium text-base" variant="link">
                  <Link href={`/buses/${tripData.bus.licensePlate}`}>{tripData.bus.licensePlate}</Link>
                </Button>
              </div>
              <div className="hidden h-10 w-px bg-border lg:block" />
            </>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('table.date')}</span>
            <span className="font-medium text-sm">{dayjs(tripData.createdAt).format('D MMM YYYY, HH:mm')}</span>
          </div>

          <div className="hidden h-10 w-px bg-border lg:block" />

          <div className="flex flex-col gap-1">
            <span className="text-nowrap text-muted-foreground text-xs uppercase">{tc('status.label')}</span>
            <Status s={tripData.status} />
          </div>
        </CardContent>
      </Card>

      {/* Summary: Stops count + Price range */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="size-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">{t('details.totalStops')}</span>
              <span className="font-bold text-2xl">{stations.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <span className="font-bold text-primary text-lg">$</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">{t('details.priceRange')}</span>
              <span className="font-bold text-2xl">
                {minPrice !== null ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice!)}` : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stations Route (read-only) */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="font-semibold text-lg">{t('details.stationsRoute')}</h2>
        </CardHeader>
        <CardContent className="flex w-full items-center gap-4 overflow-x-auto p-6">
          {stations.length > 0 ? (
            stations.map((station, index) => (
              <div className="flex items-center gap-4" key={station.id}>
                <TripStationCard index={index} station={station} totalStations={stations.length} />
                {index !== stations.length - 1 && (
                  <ArrowRight className="size-6 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))
          ) : (
            <div className="flex w-full flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <MapPin className="size-8" />
              <p className="font-medium">{t('details.noStationsYet')}</p>
              <p className="text-sm">{t('details.noStationsYetDescription')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
