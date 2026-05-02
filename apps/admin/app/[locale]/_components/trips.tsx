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
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { NewTrip } from '@/components/trip/new-trip';
import { type Route, useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';

const HEADERS_KEYS = [
  'table.name',
  'table.departure',
  'table.arrival',
  'table.licensePlate',
  'table.maxPlaces',
  'fields.seatReservationType',
  'table.status',
  'table.action',
];

export const Trips = () => {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));

  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [seatReservationType, setSeatReservationType] = useQueryState(
    'seatReservationType',
    parseAsStringEnum<string>(Object.values(BusSeatPolicy))
  );
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<TripStatus>(Object.values(TripStatus)));

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
      label: t('fields.seatReservationType'),
      options: [
        {
          label: tc('status.all'),
          value: undefined,
        },
        {
          label: t('fields.seatReservation'),
          value: BusSeatPolicy.NUMBERED,
        },
        {
          label: t('fields.noSeatReservation'),
          value: BusSeatPolicy.UNNUMBERED,
        },
      ],
      selected: seatReservationType ?? undefined,
      type: 'radio',
      value: 'seatReservationType',
    },
    {
      label: tc('status.label'),
      options: [
        {
          label: tc('status.all'),
          value: undefined,
        },
        {
          label: tc('status.active'),
          value: TripStatus.ONGOING,
        },
        {
          label: tc('status.completed'),
          value: TripStatus.COMPLETED,
        },
        {
          label: tc('status.deleted'),
          value: TripStatus.DELETED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio',
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListTripsRoutes({
    page: page.toString(),
    limit: limit.toString(),
    q: q || undefined,
    ...(status ? { status } : {}),
    ...(seatReservationType ? { seatReservationType } : {}),
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
        <SkeletonTable
          header={HEADERS_KEYS.map((key) => {
            if (key.startsWith('table.')) return tc(key);
            return t(key);
          })}
          rows={5}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS_KEYS.map((key) => (
                    <TableHead key={key}>{key.startsWith('table.') ? tc(key) : t(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((trip: Route) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.name ?? '-'}</TableCell>
                    <TableCell>{dayjs(trip.departureTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                    <TableCell>{dayjs(trip.arrivalTime).format('ddd, D MMM YYYY HH:mm') ?? '-'}</TableCell>
                    <TableCell>{trip.bus?.licensePlate}</TableCell>
                    <TableCell>
                      {trip.bus?.maxPlaces ?? '-'} {tc('table.seats')}
                    </TableCell>
                    <TableCell>
                      {trip.bus?.seatReservationType === BusSeatPolicy.NUMBERED
                        ? t('fields.seatReservation')
                        : t('fields.noSeatReservation')}
                    </TableCell>
                    <TableCell>
                      <Status s={trip.status ?? 'DEFAULT'} />
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/trips/${trip.slug}`}>{tc('view')}</Link>
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
