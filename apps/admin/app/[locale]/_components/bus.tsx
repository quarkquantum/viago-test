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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import dayjs from 'dayjs';
import { BusIcon, History, Route } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { DeleteBusDialog } from '@/components/bus/delete-bus-dialog';
import { UpdateBus } from '@/components/bus/update-bus';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { useGetBus } from '@/features/buses/api/use-get-bus';

const HEADERS_KEYS = ['table.name', 'table.departure', 'table.arrival', 'table.status', 'table.action'];

export const Bus = () => {
  const t = useTranslations('buses');
  const tt = useTranslations('trips');
  const tc = useTranslations('common');
  const params = useParams();
  const busId = params.bus as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');

  const scrollY = useRef(0);

  useDebounce(
    () => {
      scrollY.current = window.scrollY;
      setPage(1);
      setQ(query);
    },
    300,
    [query]
  );

  const queryParams = () => ({
    limit: limit.toString(),
    page: page.toString(),
    q,
  });

  const { data: busData, isLoading, refetch } = useGetBus(busId, queryParams());
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, scrollY.current);
    } // Restore scroll
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex items-end justify-between gap-2 py-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Bus Info Card */}
          <Card className="h-fit flex-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {['1', '2', '3', '4', '5', '6'].map((id) => (
                <div className="flex flex-col gap-2" key={id}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Trip Card */}
          <Card className="h-fit flex-1 rounded-2xl shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
            </CardContent>
          </Card>
        </div>

        {/* Trip History */}
        <Card className="h-fit w-full rounded-2xl shadow">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <Skeleton className="h-10 w-full" />

            <SkeletonTable header={HEADERS_KEYS.map((key) => tc(key))} rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!busData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BusIcon />
            </EmptyMedia>
            <EmptyTitle>{t('notFound')}</EmptyTitle>
            <EmptyDescription>{t('notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/buses">{t('backToBuses')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const {
    data: { bus, currentTrip },
    pagination,
  } = busData;

  const { trips } = bus;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-end justify-between gap-2 py-2">
        <div className="flex flex-col gap-2">
          <h1 className="truncate font-bold text-2xl">{t('details.title')}</h1>
          <p className="text-primary">{t('details.description')}</p>
        </div>
        <div className="flex gap-2">
          <UpdateBus busId={busId} />
          <DeleteBusDialog busId={bus.licensePlate} />
        </div>
      </div>
      <div className="flex w-full flex-col gap-6 lg:flex-row">
        <Card className="flex-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b text-lg">
            <div className="flex items-center gap-2">
              <BusIcon className="size-5.5 text-primary" />
              <span>{t('details.busInfo')}</span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{tc('table.name')}</p>
              <p className="truncate font-semibold text-lg">{bus.title}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{tc('table.licensePlate')}</p>
              <p className="truncate font-semibold text-lg">{bus.licensePlate}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{tc('table.maxPlaces')}</p>
              <p className="truncate font-semibold text-lg">{bus.maxPlaces}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{tc('table.agency')}</p>
              <Button asChild className="h-auto w-fit p-0 font-medium text-base" size="sm" variant="link">
                <Link href={`/agencies/${bus.agency?.slug}`}>{bus.agency?.name}</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{t('details.reservationType')}</p>
              <p className="truncate font-semibold text-lg">
                {bus.seatReservationType === 'SEAT_RESERVATION'
                  ? tt('fields.seatReservation')
                  : tt('fields.noSeatReservation')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{tc('table.status')}</p>
              <p className="truncate font-semibold text-lg">
                <Status s={bus.status} />
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit flex-2 rounded-2xl shadow">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b text-lg">
            <div className="flex items-center gap-2">
              <Route className="size-5 text-primary" />
              <span>{t('details.currentTrip')}</span>
            </div>
            {Boolean(currentTrip) && (
              <Button asChild size="sm" variant="link">
                <Link href={`/trips/${currentTrip?.id}`}>{tc('view')}</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="fade-in flex animate-in flex-col p-6 duration-200">
            {currentTrip ? (
              <div className="flex w-full flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t('fields.currentTrip')}
                    </span>
                    <span className="font-semibold text-lg tracking-tight">{currentTrip?.name}</span>
                  </div>
                  <Status s={currentTrip?.status} />
                </div>

                <div className="relative mt-2 flex flex-row items-center justify-between px-2 pb-2">
                  {/* Visual Timeline Line */}
                  <div className="absolute top-1.5 right-4 left-4 h-0.5 bg-linear-to-r from-primary/20 via-primary to-primary/20" />

                  {/* Departure */}
                  <div className="relative z-10 flex flex-col items-start gap-2">
                    <div className="size-3 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.2)]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[10px] text-primary uppercase tracking-widest">
                        {tc('table.departure')}
                      </span>
                      <span className="font-bold text-xl">{dayjs(currentTrip?.departureTime).format('HH:mm')}</span>
                      <span className="font-medium text-[10px] text-muted-foreground uppercase">
                        {dayjs(currentTrip?.departureTime).format('ddd, D MMM YYYY')}
                      </span>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="relative z-10 flex flex-col items-end gap-2 text-right">
                    <div className="size-3 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.2)]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[10px] text-primary uppercase tracking-widest">
                        {tc('table.arrival')}
                      </span>
                      <span className="font-bold text-xl">{dayjs(currentTrip?.arrivalTime).format('HH:mm')}</span>
                      <span className="font-medium text-[10px] text-muted-foreground uppercase">
                        {dayjs(currentTrip?.arrivalTime).format('ddd, D MMM YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Empty className="py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BusIcon />
                  </EmptyMedia>
                  <EmptyTitle className="text-lg">{t('details.noActiveTrip')}</EmptyTitle>
                  <EmptyDescription>{t('details.noActiveTripDescription')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="w-full rounded-2xl shadow">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b text-lg">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <span>{t('details.tripsHistory')}</span>
          </div>
        </CardHeader>
        <CardContent className="fade-in flex animate-in flex-col gap-4 p-6 duration-200">
          {trips?.length ? (
            <div className="w-full space-y-4">
              <SearchInput
                onChange={(e) => setQuery(e.currentTarget.value)}
                onRefresh={() => {
                  setPage(1);
                  refetch();
                }}
                placeholder={tc('search')}
                value={query}
              />
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {HEADERS_KEYS.map((key) => (
                        <TableHead key={key}>{tc(key)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="fade-in animate-in duration-200">
                    {trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>{trip.name ?? '-'}</TableCell>
                        <TableCell>{dayjs(trip.departureTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                        <TableCell>{dayjs(trip.arrivalTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                        <TableCell>
                          <Status s={trip.status ?? 'DEFAULT'} />
                        </TableCell>
                        <TableCell className="flex gap-1">
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
                limit={pagination.limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onPageChange={(newPage) => setPage(newPage)}
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.pages}
              />
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BusIcon />
                </EmptyMedia>
                <EmptyTitle>{tc('empty.noData')}</EmptyTitle>
                <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
