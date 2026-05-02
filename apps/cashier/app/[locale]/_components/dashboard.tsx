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
import {
  ArrowRight,
  Bus,
  BusIcon,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Greeting } from '@/components/greeting';
import { StatCard } from '@/components/stat-card';
import { type DashboardTrip, useGetDashboard } from '@/features/dashboard/api/use-get-dashboard';

export const Dashboard = () => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { data, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 py-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton className="mb-2 h-20 w-full rounded-lg" key={`key-${i}`} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton className="mb-2 h-20 w-full rounded-lg" key={`key-${i}`} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tickets Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="mb-2 h-20 w-full rounded-lg" key={`key-${i}`} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bus />
            </EmptyMedia>
            <EmptyTitle>{tCommon('empty.noData')}</EmptyTitle>
            <EmptyDescription>{t('empty.noDataDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const hasSoldTickets = data?.soldTickets?.data && data.soldTickets.data.length > 0;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Greeting />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          description={t('stats.totalSoldToday')}
          icon={DollarSign}
          title={t('stats.ticketsSoldToday')}
          value={data.soldTickets.count}
        />
        <StatCard
          description={t('stats.scheduledDepartures')}
          icon={BusIcon}
          title={t('stats.upcomingTrips')}
          value={data?.upcomingTripsCount}
        />
        <StatCard
          description={t('stats.inProgress')}
          icon={TicketIcon}
          title={t('stats.currentTrips')}
          value={data.currentTripsCount}
        />
      </div>

      {/* Upcoming & Current Trips Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                {t('sections.upcomingTrips')}
              </CardTitle>
              <CardDescription>{t('sections.upcomingTripsDesc')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/trips">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.upcomingTrips.length > 0 ? (
              <div className="space-y-3">
                {data?.upcomingTrips.slice(0, 5).map((trip: DashboardTrip) => (
                  <Link
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    href={`/trips/${trip.slug}`}
                    key={trip.slug}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium">
                        <Bus className="size-4" />
                        <span>{trip.name}</span>
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="size-3" />
                        <span>{trip.stations?.[0]?.name || '-'}</span>
                        <ArrowRight className="size-3" />
                        <span>{trip.stations?.[trip.stations.length - 1]?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Users className="size-3" />
                        <span>
                          {(trip.seatsSummary?.available ?? 0)} / {(trip.seatsSummary?.total ?? trip.bus.maxPlaces)}{' '}
                          {t('common.seatsAvailable')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{dayjs(trip.departureTime).format('MMM D')}</Badge>
                      <span className="flex items-center gap-1 font-medium text-sm">
                        <Clock className="size-3" />
                        {dayjs(trip.departureTime).format('HH:mm')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bus />
                  </EmptyMedia>
                  <EmptyTitle>{tCommon('empty.noTrips')}</EmptyTitle>
                  <EmptyDescription>{t('empty.noUpcomingTripsDescription')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        {/* Current Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                {t('sections.currentTrips')}
              </CardTitle>
              <CardDescription>{t('sections.currentTripsDesc')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/trips">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.currentTrips.length > 0 ? (
              <div className="space-y-3">
                {data.currentTrips.slice(0, 5).map((trip: DashboardTrip) => (
                  <Link
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    href={`/trips/${trip.slug}`}
                    key={trip.slug}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium">
                        <Bus className="size-4" />
                        <span>{trip.name}</span>
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="size-3" />
                        <span>{trip.stations?.[0]?.name || '-'}</span>
                        <ArrowRight className="size-3" />
                        <span>{trip.stations?.[trip.stations.length - 1]?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Users className="size-3" />
                        <span>
                          {(trip.seatsSummary?.available ?? 0)} / {(trip.seatsSummary?.total ?? trip.bus.maxPlaces)}{' '}
                          {t('common.seatsAvailable')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{dayjs(trip.departureTime).format('MMM D')}</Badge>
                      <span className="flex items-center gap-1 font-medium text-sm">
                        <Clock className="size-3" />
                        {dayjs(trip.arrivalTime).format('HH:mm')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bus />
                  </EmptyMedia>
                  <EmptyTitle>{tCommon('empty.noTrips')}</EmptyTitle>
                  <EmptyDescription>{t('empty.noCurrentTripsDescription')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tickets Sold Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="size-5 text-primary" />
              {t('sections.ticketsSoldToday')}
            </CardTitle>
            <CardDescription>{t('sections.ticketsSoldTodayDesc')}</CardDescription>
          </div>
          <Button asChild size="sm" variant="link">
            <Link href="/tickets">{tCommon('viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {hasSoldTickets ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.soldTickets.data.map((ticket) => (
                <Link
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  href={`/tickets/${ticket.id}`}
                  key={ticket.id}
                >
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-medium">
                      <Users className="size-4" />
                      <span>{ticket.passenger.fullName}</span>
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Bus className="size-3" />
                      <span>{ticket.booking.trip.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <TicketIcon className="size-3" />
                        {t('common.seat')} {ticket.seat.number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {dayjs(ticket.createdAt).format('HH:mm')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TicketIcon />
                </EmptyMedia>
                <EmptyTitle>{tCommon('empty.noTickets')}</EmptyTitle>
                <EmptyDescription>{t('empty.noTicketsDescription')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
