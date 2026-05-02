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
import { BookingStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Booking, useListBookings } from '@/features/bookings/api/use-list-bookings';
import { formatCurrency } from '@/helpers/format-currency';

export const Bookings = () => {
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<BookingStatus>(Object.values(BookingStatus)));

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
      label: t('list.filter.status'),
      options: [
        { label: t('list.filter.all'), value: undefined },
        { label: t('list.filter.pending'), value: BookingStatus.PENDING },
        { label: t('list.filter.confirmed'), value: BookingStatus.CONFIRMED },
        { label: t('list.filter.cancelled'), value: BookingStatus.DELETED },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListBookings({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
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
            setStatus((newFilter.status as BookingStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable
          header={[
            tCommon('table.passenger'),
            tCommon('table.trip'),
            tCommon('table.from'),
            tCommon('table.to'),
            tCommon('table.seats'),
            tCommon('table.departure'),
            t('table.total'),
            tCommon('table.status'),
            tCommon('table.action'),
          ]}
          rows={5}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('table.passenger')}</TableHead>
                  <TableHead>{tCommon('table.trip')}</TableHead>
                  <TableHead>{tCommon('table.from')}</TableHead>
                  <TableHead>{tCommon('table.to')}</TableHead>
                  <TableHead>{tCommon('table.seats')}</TableHead>
                  <TableHead>{tCommon('table.departure')}</TableHead>
                  <TableHead>{t('table.total')}</TableHead>
                  <TableHead>{tCommon('table.status')}</TableHead>
                  <TableHead>{tCommon('table.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{booking.passenger?.fullName ?? '-'}</span>
                        <span className="text-muted-foreground text-xs">{booking.passenger?.email ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.trip ? (
                        <Link className="text-primary hover:underline" href={`/trips/${booking.trip.id}`}>
                          {booking.trip.name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>{' '}
                    <TableCell>{booking.fromStation?.name ?? '-'}</TableCell>
                    <TableCell>{booking.toStation?.name ?? '-'}</TableCell>
                    <TableCell>
                      {booking.seat?.number !== undefined
                        ? t('table.seatWithNumber', { number: booking.seat.number })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {booking.fromStation?.departureTime
                        ? dayjs(booking.fromStation.departureTime).format('ddd, D MMM YYYY HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(booking.total)}</span>
                    </TableCell>
                    <TableCell>
                      <Status s={booking.status ?? 'PENDING'} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/bookings/${booking.id}`}>{tCommon('view')}</Link>
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
              <CalendarCheck />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
