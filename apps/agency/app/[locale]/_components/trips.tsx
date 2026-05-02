'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import { BusSeatPolicy, TripStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Bus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewTrip } from '@/components/new-trip';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Route, useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';

const HEADERS_KEYS = [
  'table.name',
  'table.departure',
  'table.arrival',
  'table.licensePlate',
  'table.maxPlaces',
  'table.reservationType',
  'table.status',
  'table.action',
];

export const Trips = () => {
  const t = useTranslations('trips');
  const tCommon = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState('status', parseAsStringEnum<TripStatus>(Object.values(TripStatus)));
  const [seatReservationType, setSeatReservationType] = useQueryState(
    'seatReservationType',
    parseAsStringEnum(Object.values(BusSeatPolicy) as string[])
  );

  useDebounce(
    () => {
      if (query !== q) {
        setPage(1);
        setQ(query || null);
      }
    },
    300,
    [query]
  );

  useEffect(() => {
    setQuery(q || '');
  }, [q]);

  const filterList = [
    {
      label: t('list.reservationType.label'),
      options: [
        {
          label: t('list.reservationType.all'),
          value: undefined,
        },
        {
          label: t('list.reservationType.numbered'),
          value: BusSeatPolicy.NUMBERED,
        },
        {
          label: t('list.reservationType.unnumbered'),
          value: BusSeatPolicy.UNNUMBERED,
        },
      ],
      selected: seatReservationType ?? undefined,
      type: 'radio' as const,
      value: 'seatReservationType',
    },
    {
      label: tCommon('status.label'),
      options: [
        {
          label: tCommon('status.all'),
          value: undefined,
        },
        {
          label: tCommon('status.active'),
          value: TripStatus.ONGOING,
        },
        {
          label: tCommon('status.completed'),
          value: TripStatus.COMPLETED,
        },
        {
          label: tCommon('status.deleted'),
          value: TripStatus.DELETED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListTripsRoutes({
    page: page.toString(),
    limit: limit.toString(),
    q: q || undefined,
    status: status || undefined,
    seatReservationType: seatReservationType || undefined,
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewTrip />
        </div>
        <p className="text-primary">{t('list.description')}</p>
      </div>

      <SearchInput
        filter={filterList}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('list.searchPlaceholder')}
        setFilter={(newFilter) => {
          if ('status' in newFilter) {
            setStatus((newFilter.status as TripStatus) || null);
            setPage(1);
          }
          if ('seatReservationType' in newFilter) {
            setSeatReservationType(newFilter.seatReservationType || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable header={HEADERS_KEYS.map((key) => tCommon(key))} rows={5} />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS_KEYS.map((key) => (
                    <TableHead key={key}>{tCommon(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((trip: Route) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.name ?? '-'}</TableCell>
                    <TableCell>{dayjs(trip.departureTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                    <TableCell>{dayjs(trip.arrivalTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                    <TableCell>
                      {trip.bus.licensePlate ? (
                        <Link className="text-primary hover:underline" href={`/buses/${trip.bus.licensePlate}`}>
                          {trip.bus.licensePlate}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {trip.bus?.maxPlaces ?? '-'} {t('units.seats')}
                    </TableCell>
                    <TableCell>
                      {trip.bus?.seatReservationType === 'NUMBERED'
                        ? t('list.reservationType.numbered')
                        : t('list.reservationType.unnumbered')}
                    </TableCell>
                    <TableCell>
                      <Status s={trip.status ?? 'DEFAULT'} />
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/trips/${trip.slug}`}>{tCommon('view')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChange={(newPage) => setPage(newPage)}
            page={data.pagination.page}
            total={data.pagination.total}
            totalPages={data.pagination.pages}
          />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bus />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
