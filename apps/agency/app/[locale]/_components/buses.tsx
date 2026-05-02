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
import { BusSeatPolicy, BusStatus } from '@repo/shared';
import { Bus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewBus } from '@/components/new-bus';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Bus as BusType, useListBuses } from '@/features/buses/api/use-list-buses';

const HEADERS_KEYS = [
  'table.name',
  'table.licensePlate',
  'table.maxPlaces',
  'table.currentTrip',
  'table.status',
  'table.reservationType',
  'table.action',
];

export const Buses = () => {
  const t = useTranslations('buses');
  const tCommon = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState('status', parseAsStringEnum(Object.values(BusStatus) as string[]));
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
          value: BusStatus.ACTIVE,
        },
        {
          label: tCommon('status.inactive'),
          value: BusStatus.INACTIVE,
        },
        {
          label: tCommon('status.maintenance'),
          value: BusStatus.MAINTENANCE,
        },
        {
          label: tCommon('status.breakdown'),
          value: BusStatus.BREAKDOWN,
        },
        {
          label: tCommon('status.outOfService'),
          value: BusStatus.OUT_OF_SERVICE,
        },
        {
          label: tCommon('status.toReplace'),
          value: BusStatus.TO_REPLACE,
        },
        {
          label: tCommon('status.deleted'),
          value: BusStatus.DELETED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListBuses({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    seatReservationType: seatReservationType || undefined,
    status: status || undefined,
  });

  const buses = data?.data;
  console.log(data);

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewBus />
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
            setStatus((newFilter.status as BusStatus) || null);
            setPage(1);
          }
          if ('seatReservationType' in newFilter) {
            setSeatReservationType((newFilter.seatReservationType as BusSeatPolicy) || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable header={HEADERS_KEYS.map((key) => tCommon(key))} rows={5} />
      ) : buses && buses.length > 0 ? (
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
                {buses?.map((bus: BusType) => (
                  <TableRow key={bus.id}>
                    <TableCell>{bus.title ?? '-'}</TableCell>
                    <TableCell>{bus.licensePlate ?? '-'}</TableCell>
                    <TableCell>{bus.maxPlaces ?? '-'}</TableCell>
                    <TableCell>
                      {bus.trips && bus.trips.length > 0 ? (
                        <Link className="text-primary hover:underline" href={`/trips/${bus.trips[0].id}`}>
                          {bus.trips[0].name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Status s={bus.status} />
                    </TableCell>
                    <TableCell>
                      {bus.seatReservationType === BusSeatPolicy.NUMBERED
                        ? t('list.reservationType.numbered')
                        : t('list.reservationType.unnumbered')}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/buses/${bus.licensePlate}`}>{tCommon('view')}</Link>
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
