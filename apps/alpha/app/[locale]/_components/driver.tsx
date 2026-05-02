'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import dayjs from 'dayjs';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Route,
  TextSelection,
  Ticket,
  User,
  User2,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { DeleteDriverDialog } from '@/components/driver/delete-driver-dialog';
import { UpdateDriver } from '@/components/driver/update-driver';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { useGetDriver } from '@/features/drivers/api/use-get-driver';
import { Link } from '@/i18n/routing';

export const Driver = () => {
  const t = useTranslations();
  const locale = useLocale();
  const tripHeaders = [
    t('drivers.tripTable.trip'),
    t('drivers.tripTable.status'),
    t('drivers.tripTable.bus'),
    t('drivers.tripTable.departure'),
    t('drivers.tripTable.arrival'),
    t('drivers.tripTable.createdAt'),
    t('drivers.tripTable.action'),
  ];

  const params = useParams();
  const driverId = params.driver as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');

  useDebounce(
    () => {
      setPage(1);
      setQ(query);
    },
    300,
    [query]
  );

  const {
    data: driverData,
    isLoading,
    refetch,
  } = useGetDriver(driverId, {
    limit: limit.toString(),
    page: page.toString(),
    q,
  });

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <SkeletonTable header={tripHeaders} rows={5} />
      </div>
    );
  }

  if (!driverData || 'message' in driverData || !driverData.data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>{t('drivers.profile.driverNotFound')}</EmptyTitle>
            <EmptyDescription>{t('drivers.profile.driverNotFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/drivers">{t('drivers.profile.backToDrivers')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { user, agency, trips } = driverData.data;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">{t('drivers.profile.title')}</h1>
          <div className="flex gap-2">
            <UpdateDriver id={driverId} />
            <DeleteDriverDialog driverId={driverId} />
          </div>
        </div>
        <p className="text-primary">{t('drivers.profile.description')}</p>
      </div>

      {/* Driver Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User2 className="size-5 text-primary" />
                {t('drivers.profile.personalInfo')}
              </CardTitle>
              <CardDescription>{t('drivers.profile.personalInfoDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.fullName')}</p>
                <p className="truncate font-medium">{user.fullName || user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.emailAddress')}</p>
                <p className="truncate font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.phoneNumber')}</p>
                <p className="font-medium">{user.profile?.phoneNumber || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.status.label')}</p>
                <p className="font-medium">
                  {user.emailVerified ? t('common.status.verified') : t('common.status.notVerified')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                {t('drivers.profile.agencyDetails')}
              </CardTitle>
              <CardDescription>{t('drivers.profile.agencyDetailsDescription')}</CardDescription>
            </div>
            {agency ? (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Building2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{t('drivers.profile.agencyName')}</p>
                    <p className="truncate font-medium">{agency.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <TextSelection className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{t('drivers.profile.agencyDescription')}</p>
                    <p className="truncate font-medium">{agency.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{t('drivers.profile.agencyStatus')}</p>
                    <Status s={agency.status} />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{t('drivers.profile.memberSince')}</p>
                    <p className="font-medium">
                      {dayjs(driverData.data.createdAt).locale(locale).format('MMM D, YYYY')}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-sm">{t('drivers.profile.noAgency')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trips History */}
      <div className="space-y-4">
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Route className="size-5 text-primary" />
                  {t('drivers.profile.tripsHistory')}
                </CardTitle>
                <CardDescription>{t('drivers.profile.tripsHistoryDescription')}</CardDescription>
              </div>
            </div>

            <SearchInput
              onChangeAction={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)}
              onRefreshAction={() => {
                setPage(1);
                refetch();
              }}
              placeholder={t('drivers.profile.tripsSearchPlaceholder')}
              value={query}
            />

            {trips.length > 0 ? (
              <div className="flex w-full flex-col gap-4">
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tripHeaders.map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell className="font-medium">{trip.name}</TableCell>
                          <TableCell>
                            <Status s={trip.status} />
                          </TableCell>
                          <TableCell>{trip.bus.title}</TableCell>
                          <TableCell>
                            {dayjs(trip.departureTime).locale(locale).format('ddd, D MMM YYYY h:mm A')}
                          </TableCell>
                          <TableCell>
                            {dayjs(trip.arrivalTime).locale(locale).format('ddd, D MMM YYYY h:mm A')}
                          </TableCell>
                          <TableCell>{dayjs(trip.createdAt).locale(locale).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/trips/${trip.id}`}>{t('drivers.tripTable.view')}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationMenu
                  limit={driverData.pagination.limit}
                  onLimitChangeAction={(newLimit: number) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  onPageChangeAction={(newPage: number) => setPage(newPage)}
                  page={driverData.pagination.page}
                  total={driverData.pagination.total}
                  totalPages={driverData.pagination.pages}
                />
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Ticket />
                  </EmptyMedia>
                  <EmptyTitle>{t('drivers.profile.noTrips')}</EmptyTitle>
                  <EmptyDescription>{t('drivers.profile.noTripsDescription')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
