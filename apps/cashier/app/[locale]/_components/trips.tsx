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
import { TripStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Bus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';

export const Trips = () => {
  const t = useTranslations('trips');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<TripStatus>(Object.values(TripStatus)));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

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
      label: t('common.status.label'),
      options: [
        {
          label: t('common.status.all'),
          value: undefined,
        },
        {
          label: t('common.status.ongoing'),
          value: TripStatus.ONGOING,
        },
        {
          label: t('common.status.completed'),
          value: TripStatus.COMPLETED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListTripsRoutes({
    limit: limit.toString(),
    page: page.toString(),
    q,
    ...(status ? { status } : {}),
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
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
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable
          header={[
            t('common.table.agency'),
            t('common.table.from'),
            t('common.table.to'),
            t('common.table.departure'),
            t('common.table.seats'),
            t('common.table.status'),
            t('common.table.action'),
          ]}
          rows={5}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.table.agency')}</TableHead>
                  <TableHead>{t('common.table.from')}</TableHead>
                  <TableHead>{t('common.table.to')}</TableHead>
                  <TableHead>{t('common.table.departure')}</TableHead>
                  <TableHead>{t('common.table.seats')}</TableHead>
                  <TableHead>{t('common.table.status')}</TableHead>
                  <TableHead>{t('common.table.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.agency?.name ?? '-'}</TableCell>
                    <TableCell>{trip.stations[0]?.name ?? '-'}</TableCell>
                    <TableCell>{trip.stations.at(-1)?.name ?? '-'}</TableCell>
                    <TableCell>
                      {trip.stations[0]?.departureTime
                        ? dayjs(trip.stations[0].departureTime).format('ddd, D MMM YYYY HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {trip.seatsSummary
                        ? `${trip.seatsSummary.available}/${trip.seatsSummary.total}`
                        : (trip.bus?.maxPlaces ?? '-')}
                    </TableCell>
                    <TableCell>
                      <Status s={trip.status ?? 'DEFAULT'} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/trips/${trip.slug}`}>{t('common.view')}</Link>
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
            <EmptyTitle>{t('common.empty.noTrips')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
