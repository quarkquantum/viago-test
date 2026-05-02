'use client';

import { Badge } from '@repo/design-system/web/src/components/ui/badge';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { ArrowRight, Building2, Bus, Calendar, CalendarCheck, Check, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Greeting } from '@/components/greeting';
import { StatCard } from '@/components/stat-card';
import { useGetDashboard } from '@/features/dashboard/api/use-get-dashboard';
import { formatCurrency } from '@/helpers/format-currency';

export const Dashboard = () => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { data, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={`key-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton className="mb-2 h-12 w-full" key={`key-${i}`} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton className="mb-2 h-12 w-full" key={`key-${i}`} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t('empty.agencyNotFound')}</EmptyTitle>
            <EmptyDescription>{t('empty.agencyNotFoundDesc')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const { stats, recentBookings, workingBuses } = data.data;
  console.log(workingBuses);
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Greeting />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description={t('stats.fleetSize')}
          icon={Bus}
          title={t('stats.totalBuses')}
          value={stats.buses.total}
        />
        <StatCard
          description={t('stats.activeTripsDesc', { count: stats.trips.active })}
          icon={MapPin}
          title={t('stats.activeTrips')}
          value={stats.trips.active}
        />
        <StatCard
          description={formatCurrency(stats.bookings.todayRevenue._sum.total || 0)}
          icon={Calendar}
          title={t('stats.todaysBookings')}
          value={stats.bookings.today}
        />
        <StatCard
          description={t('stats.finishedJourneys')}
          icon={Check}
          title={t('stats.completedTrips')}
          value={stats.trips.completed}
        />
      </div>

      {/* Recent Bookings & Upcoming Trips */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="size-5 text-primary" />
                {t('sections.recentBookings')}
              </CardTitle>
              <CardDescription>{t('sections.latestBookingActivity')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/bookings">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <Link
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    href={`/bookings/${booking.id}`}
                    key={booking.id}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium">
                        <Users className="size-4" />
                        <span>{booking.passenger?.fullName || t('cards.unknown')}</span>
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>{booking.fromStation?.name}</span>
                        <ArrowRight className="size-3" />
                        <span>{booking.toStation?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Bus className="size-3" />
                        <span>{booking.trip?.name || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {/* <Status s={booking.status} /> */}
                      <span className="font-medium text-sm">{formatCurrency(booking.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarCheck />
                  </EmptyMedia>
                  <EmptyTitle>{t('empty.noRecentBookings')}</EmptyTitle>
                  <EmptyDescription>{t('empty.noRecentBookingsDesc')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                {t('sections.activeBuses')}
              </CardTitle>
              <CardDescription>{t('sections.onRouteBuses')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/buses">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="h-full">
            {workingBuses && workingBuses.length > 0 ? (
              <div className="space-y-4">
                {workingBuses.map((bus: any) => (
                  <Link
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    href={`/buses/${bus.licensePlate}`}
                    key={bus.id}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium">
                        <Bus className="size-4" />
                        <span>{bus.licensePlate}</span>
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>{bus.trips?.[0]?.stations?.[0]?.name || t('cards.unknown')}</span>
                        <ArrowRight className="size-3" />
                        <span>
                          {bus.trips?.[0]?.stations?.[bus.trips?.[0]?.stations?.length - 1]?.name || t('cards.unknown')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Users className="size-3" />
                        <span>
                          {bus?.seats?.reduce((acc: any, seat: any) => acc + (seat.status === 'FILLED' ? 1 : 0), 0) ?? 0}
                          /{bus.maxPlaces || 0} {t('cards.booked')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="outline">{dayjs(bus.trips?.[0]?.departureTime).format('MMM D')}</Badge>
                      <span className="font-medium text-sm">
                        {dayjs(bus.trips?.[0]?.departureTime).format('HH:mm')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bus />
                  </EmptyMedia>
                  <EmptyTitle>{t('empty.noUpcomingTrips')}</EmptyTitle>
                  <EmptyDescription>{t('empty.noUpcomingTripsDesc')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
