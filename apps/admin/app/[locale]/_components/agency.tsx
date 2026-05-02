'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/web/src/components/ui/avatar';
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
import { ArrowRight, Building2, Bus, Calendar, Clock, MapPin, UserSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DeleteAgencyDialog } from '@/components/agency/delete-agency-dialog';
import { UpdateAgency } from '@/components/agency/update-agency';
import { StatCard } from '@/components/stat-card';
import { Status } from '@/components/status';
import { UpdateUser } from '@/components/user/update-user';
import { useGetAgency } from '@/features/agencies/api/use-get-agency';

export const Agency = () => {
  const t = useTranslations('agencies');
  const tc = useTranslations('common');
  const params = useParams();
  const agencyId = params.agency as string;
  const { data: agency, isLoading, error } = useGetAgency(agencyId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {['1', '2', '3', '4', '5'].map((id) => (
                <Skeleton className="mb-2 h-12 w-full" key={id} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {['1', '2', '3', '4', '5'].map((id) => (
                <Skeleton className="mb-2 h-12 w-full" key={id} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t('list.notFound')}</EmptyTitle>
            <EmptyDescription>{t('list.notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border">
              <AvatarImage src={agency?.data.logo ?? ''} />
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="font-semibold text-2xl">{agency?.data.name}</h1>
            <Status s={agency?.data.status} />
          </div>
          <p className="text-muted-foreground">{agency?.data.description || t('details.noDescription')}</p>
        </div>
        <div className="flex gap-2">
          {agency.data.owner?.id ? (
            <UpdateUser id={agency.data.owner.id} label={t('details.updateOwnerDetails')} />
          ) : null}
          <UpdateAgency identifier={agency?.data.slug} />
          <DeleteAgencyDialog agencyId={agency?.data.slug} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description={t('details.ownerAccount')}
          icon={UserSquare}
          title={t('details.agencyOwner')}
          value={agency?.data.owner?.fullName || 'N/A'}
        />
        <StatCard
          description={t('details.activeVehicles')}
          icon={Bus}
          title={t('details.totalBuses')}
          value={agency.data.totalBuses ?? 0}
        />
        <StatCard
          description={t('details.registeredDrivers')}
          icon={Users}
          title={t('details.totalDrivers')}
          value={agency.data.totalDrivers ?? 0}
        />
        <StatCard
          description={dayjs(agency?.data.createdAt).format('D, dddd HH:mm')}
          icon={Calendar}
          title={tc('table.createdAt')}
          value={dayjs(agency?.data.createdAt).format('MMM YYYY')}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Buses Column */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bus className="size-5 text-primary" />
                {t('details.activeBuses')}
              </CardTitle>
              <CardDescription>{t('details.activeBusesDescription')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/buses">{t('details.viewAll')}</Link>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {agency?.data.buses && agency.data.buses.length > 0 ? (
                agency.data.buses.map((bus) => (
                  <Link
                    className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    href={`/buses/${bus.licensePlate}`}
                    key={bus.id}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold">
                          <Bus className="size-4 text-primary" />
                          {bus.licensePlate}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                          {bus.maxPlaces} {t('details.seats')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="size-3" />
                        <span className="max-w-37.5 truncate">
                          {bus.trips?.[0]?.stations?.[0]?.name || t('details.depot')}
                        </span>
                        <ArrowRight className="size-3" />
                        <span className="max-w-37.5 truncate">
                          {bus.trips?.[0]?.stations?.[bus.trips?.[0]?.stations?.length - 1]?.name ||
                            t('details.unknown')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Users className="size-3" />
                        <span>
                          {/* {bus?.seats.reduce((acc, seat) => acc + (seat.status === 'FILLED' ? 1 : 0), 0)}{' '} */}
                          {t('details.booked')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <Clock className="size-3" />
                        {dayjs(bus.trips?.[0]?.departureTime).format('HH:mm')}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <Empty className="col-span-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Bus />
                    </EmptyMedia>
                    <EmptyTitle>{t('details.noBuses')}</EmptyTitle>
                    <EmptyDescription>{t('details.noBusesDescription')}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers Column */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserSquare className="size-5 text-primary" />
                {t('details.drivers')}
              </CardTitle>
              <CardDescription>{t('details.associatedDrivers')}</CardDescription>
            </div>
            <Button asChild size="sm" variant="link">
              <Link href="/drivers">{t('details.viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {agency.data.members && agency.data.members.length > 0 ? (
              <div className="divide-y">
                {agency.data.members.map((member: any) => (
                  <div
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    key={member.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <UserSquare className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{member.user.fullName}</span>
                        <span className="text-muted-foreground text-xs">{member.user.profile?.phoneNumber || '-'}</span>
                      </div>
                    </div>
                    <Button asChild className="h-8 w-8" size="icon" variant="ghost">
                      <Link href={`/drivers/${member.id}`}>
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
                    <EmptyTitle>{t('details.noDrivers')}</EmptyTitle>
                    <EmptyDescription>{t('details.noDriversDescription')}</EmptyDescription>
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
