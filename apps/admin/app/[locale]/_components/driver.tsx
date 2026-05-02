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
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { DeleteDriverDialog } from '@/components/driver/delete-driver-dialog';
import { UpdateDriver } from '@/components/driver/update-driver';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { BanUserDialog } from '@/components/user/ban-user-dialog';
import { UserSessionsDialog } from '@/components/user/user-sessions-dialog';
import { type DriverResponse, useGetDriver } from '@/features/drivers/api/use-get-driver';
import { useSendResetPasswordEmail } from '@/features/users/api/use-send-reset-password-email';
import { useUnbanUser } from '@/features/users/api/use-unban-user';

const TRIP_HEADERS_KEYS = [
  'table.trip',
  'table.status',
  'table.bus',
  'table.departure',
  'table.arrival',
  'table.createdAt',
  'table.action',
];

export const Driver = () => {
  const t = useTranslations('drivers');
  const tc = useTranslations('common');
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
  const sendResetEmail = useSendResetPasswordEmail(driverId);
  const unbanUser = useUnbanUser(driverId, { onSuccess: refetch });

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
        <SkeletonTable header={TRIP_HEADERS_KEYS.map((key) => tc(key))} rows={5} />
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
            <EmptyTitle>{t('list.notFound')}</EmptyTitle>
            <EmptyDescription>{t('list.notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/drivers">{t('list.backToDrivers')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { user: driver, agency, trips } = driverData.data;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <div className="flex gap-2">
            <UserSessionsDialog userId={driverId} />
            <Button disabled={sendResetEmail.isPending} onClick={() => sendResetEmail.mutate()} variant="outline">
              <Mail className="mr-2 size-4" />
              {sendResetEmail.isPending ? tc('updating') : t('resetPassword.trigger')}
            </Button>
            {driver.banned ? (
              <Button disabled={unbanUser.isPending} onClick={() => unbanUser.mutate()} variant="outline">
                {unbanUser.isPending ? t('ban.unbanning') : t('ban.unban')}
              </Button>
            ) : (
              <BanUserDialog userId={driverId} />
            )}
            <UpdateDriver id={driverId} />
            <DeleteDriverDialog driverId={driverId} />
          </div>
        </div>
        <p className="text-primary">{t('details.description')}</p>
      </div>

      {/* Driver Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User2 className="size-5 text-primary" />
                {t('details.personalInfo')}
              </CardTitle>
              <CardDescription>{t('details.personalInfoDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.fullName')}</p>
                <p className="truncate font-medium">{driver.fullName || driver.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.emailAddress')}</p>
                <p className="truncate font-medium">{driver.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.phoneNumber')}</p>
                <p className="font-medium">{driver.profile?.phoneNumber || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.status')}</p>
                <p className="font-medium">
                  {driver.banned ? (
                    <span className="font-bold text-destructive">
                      {tc('table.banned')}
                      <span className="ml-2 text-xs">({driver.banReason})</span>
                    </span>
                  ) : driver.emailVerified ? (
                    t('details.verified')
                  ) : (
                    t('details.notVerified')
                  )}
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
                {t('details.agencyDetails')}
              </CardTitle>
              <CardDescription>{t('details.agencyDetailsDescription')}</CardDescription>
            </div>
            {agency ? (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Building2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyName')}</p>
                    <p className="truncate font-medium">{agency.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <TextSelection className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyDescription')}</p>
                    <p className="truncate font-medium">{agency.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyStatus')}</p>
                    <Status s={agency.status} />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{t('details.memberSince')}</p>
                    <p className="font-medium">{dayjs(driverData.data.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-sm">{t('details.noAgency')}</p>
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
                  {t('details.tripsHistory')}
                </CardTitle>
                <CardDescription>{t('details.tripsHistoryDescription')}</CardDescription>
              </div>
            </div>

            <SearchInput
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
              placeholder={tc('search')}
              value={query}
            />

            {trips.length > 0 ? (
              <div className="flex w-full flex-col gap-4">
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {TRIP_HEADERS_KEYS.map((key) => (
                          <TableHead key={key}>{tc(key)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip: DriverResponse['data']['trips'][number]) => (
                        <TableRow key={trip.id}>
                          <TableCell className="font-medium">{trip.name}</TableCell>
                          <TableCell>
                            <Status s={trip.status} />
                          </TableCell>
                          <TableCell>{trip.bus.title}</TableCell>
                          <TableCell>{dayjs(trip.departureTime).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                          <TableCell>{dayjs(trip.arrivalTime).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                          <TableCell>{dayjs(trip.createdAt).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/trips/${trip.id}`}>{tc('view')}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationMenu
                  limit={driverData.pagination.limit}
                  onLimitChange={(newLimit: number) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  onPageChange={(newPage: number) => setPage(newPage)}
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
                  <EmptyTitle>{tc('empty.noData')}</EmptyTitle>
                  <EmptyDescription>{t('details.tripsHistoryDescription')}</EmptyDescription>
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
