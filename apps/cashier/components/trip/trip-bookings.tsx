import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@repo/design-system/web/src/components/ui/card';
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
import { CalendarCheck, TicketIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { Status } from '@/components/status';
import type { Booking } from '@/features/trips/api/use-get-trip';
import { formatCurrency } from '@/helpers/format-currency';

type TripBookingsProps = {
  bookings: Booking[];
  refetch: () => void;
};

export const TripBookings = ({ bookings, refetch }: TripBookingsProps) => {
  const t = useTranslations('common');
  const tTrips = useTranslations('trips');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(5));
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<BookingStatus>(Object.values(BookingStatus)));

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
      label: t('status.label'),
      options: [
        {
          label: t('status.all'),
          value: undefined,
        },
        {
          label: t('status.confirmed'),
          value: BookingStatus.CONFIRMED,
        },
        {
          label: t('status.pending'),
          value: BookingStatus.PENDING,
        },
        {
          label: t('status.completed'),
          value: BookingStatus.COMPLETED,
        },
        {
          label: t('status.deleted'),
          value: BookingStatus.DELETED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  // Client-side filtering
  const filteredBookings = bookings.filter((booking) => {
    const searchMatch =
      booking.passenger?.fullName?.toLowerCase().includes(q.toLowerCase()) ||
      booking.passenger?.email?.toLowerCase().includes(q.toLowerCase()) ||
      booking.id.toLowerCase().includes(q.toLowerCase());

    const statusMatch = !status || booking.status === status;

    return searchMatch && statusMatch;
  });

  // Client-side pagination
  const total = filteredBookings.length;
  const pages = Math.ceil(total / limit);
  const paginatedBookings = filteredBookings.slice((page - 1) * limit, page * limit);

  return (
    <Card className="h-full w-full rounded-2xl shadow">
      <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="size-5 text-primary" />
            {tTrips('details.bookings.title')}
          </CardTitle>
          <CardDescription>{tTrips('details.bookings.description')}</CardDescription>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="w-full space-y-4">
            <SearchInput
              filter={filterList}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
              placeholder={t('search')}
              setFilter={(newFilter) => {
                if ('status' in newFilter) {
                  setStatus((newFilter.status as BookingStatus) || null);
                  setPage(1);
                }
              }}
              value={query}
            />
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.passenger')}</TableHead>
                    <TableHead>
                      {t('table.from')} → {t('table.to')}
                    </TableHead>
                    <TableHead>{t('table.departure')}</TableHead>
                    <TableHead>{t('table.to')}</TableHead>
                    <TableHead>{t('table.seat')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.price')}</TableHead>
                    <TableHead className="text-center">{t('table.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="fade-in animate-in duration-200">
                  {paginatedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{booking.passenger?.fullName || t('common.unknown')}</span>
                          <span className="text-muted-foreground text-xs">{booking.passenger?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.fromStation?.name} → {booking.toStation?.name}
                      </TableCell>
                      <TableCell>{dayjs(booking.fromStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{dayjs(booking.toStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{booking.seat?.number ?? t('common.unassigned')}</TableCell>
                      <TableCell>
                        <Status s={booking.status} />
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(booking.total)}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/tickets/${booking.ticket?.id}`}>{t('view')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedBookings.length === 0 && (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={8}>
                        {t('empty.noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationMenu
              limit={limit}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              onPageChange={(p) => setPage(p)}
              page={page}
              total={total}
              totalPages={pages}
            />
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarCheck />
              </EmptyMedia>
              <EmptyTitle>{tTrips('details.bookings.noBookings')}</EmptyTitle>
              <EmptyDescription>{tTrips('details.bookings.noBookingsDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
};
