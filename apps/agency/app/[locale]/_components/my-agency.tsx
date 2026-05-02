'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/web/src/components/ui/avatar';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { ArrowRight, Building2, Bus, Calendar, MapPin, Ticket, UserSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { StatCard } from '@/components/stat-card';
import { Status } from '@/components/status';
import { UpdateProfile } from '@/components/update-profile';
import { UpdateUser } from '@/components/update-user';
import { useGetMyAgency } from '@/features/me/api/use-get-my-agency';

export const MyAgency = () => {
  const t = useTranslations('agency');
  const tCommon = useTranslations('common');
  const { data, isLoading, error } = useGetMyAgency();

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['stat-1', 'stat-2', 'stat-3', 'stat-4'].map((key) => (
            <Card key={key}>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {['col-1', 'col-2', 'col-3'].map((key) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                {['line-1', 'line-2', 'line-3', 'line-4', 'line-5'].map((lineKey) => (
                  <Skeleton className="mb-2 h-12 w-full" key={lineKey} />
                ))}
              </CardContent>
            </Card>
          ))}
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

  const { agency, _count, recentBookings, upcomingTrips, drivers } = data.data;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border">
              <AvatarImage src={agency?.logo || undefined} />
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="font-semibold text-2xl">{agency?.name}</h1>
            <Status s={agency?.status} />
          </div>
          <p className="text-muted-foreground">{agency?.description || t('details.noDescription')}</p>
        </div>
        <div className="flex gap-2">
          <UpdateUser label={t('updateOwnerDetails')} />
          <UpdateProfile />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description={t('details.ownerAccount')}
          icon={UserSquare}
          title={t('details.owner')}
          value={agency?.owner?.fullName || 'N/A'}
        />
        <StatCard
          description={t('details.activeVehicles')}
          icon={Bus}
          title={t('details.totalBuses')}
          value={_count.totalBuses ?? 0}
        />
        <StatCard
          description={t('details.registeredDrivers')}
          icon={Users}
          title={t('details.totalDrivers')}
          value={_count.totalDrivers ?? 0}
        />
        <StatCard
          description={dayjs(agency?.createdAt).format('D, dddd HH:mm')}
          icon={Calendar}
          title={t('details.created')}
          value={dayjs(agency?.createdAt).format('MMM YYYY')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Bookings Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="size-4 text-primary" />
                {t('sections.recentBookings')}
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/bookings">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentBookings && recentBookings.length > 0 ? (
              <div className="divide-y overflow-hidden border-t">
                {recentBookings.map((booking) => (
                  <div
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    key={booking.id}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{booking.passenger?.fullName}</span>
                      <span className="text-muted-foreground text-xs">
                        {booking.fromStation?.name} → {booking.toStation?.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Status s={booking.status} />
                      <span className="font-medium text-xs">
                        {tCommon('currency')}
                        {booking.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Ticket />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">{t('empty.noRecentBookings')}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Trips Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-primary" />
                {t('sections.upcomingTrips')}
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/trips">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingTrips && upcomingTrips.length > 0 ? (
              <div className="divide-y overflow-hidden border-t">
                {upcomingTrips.map((trip) => (
                  <Link
                    className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50"
                    href={`/trips/${trip.id}`}
                    key={trip.id}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{trip.name}</span>
                      <span className="text-muted-foreground text-xs">{dayjs(trip.departureTime).format('HH:mm')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Bus className="size-3" />
                        <span>{trip.bus?.licensePlate}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {dayjs(trip.departureTime).format('ddd, D MMM')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">{t('empty.noTrips')}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drivers Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserSquare className="size-4 text-primary" />
                {t('details.drivers')}
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/drivers">{tCommon('viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {drivers && drivers.length > 0 ? (
              <div className="divide-y overflow-hidden border-t">
                {drivers.map((driver) => (
                  <div
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    key={driver.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <UserSquare className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{driver.user.fullName}</span>
                        <span className="text-muted-foreground text-xs">{driver.user.profile?.phoneNumber || '-'}</span>
                      </div>
                    </div>
                    <Button asChild className="h-8 w-8" size="icon" variant="ghost">
                      <Link href={`/drivers/${driver.id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">{t('details.noDrivers')}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
