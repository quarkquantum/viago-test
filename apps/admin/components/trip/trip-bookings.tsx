'use client';

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
import dayjs from 'dayjs';
import { CalendarCheck, TicketIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { Status } from '@/components/status';
import { formatCurrency } from '@/helpers/format-currency';

type Booking = {
  id: string;
  total: number;
  status: string;
  seat: { number: string | number };
  passenger?: { fullName?: string | null; email?: string | null };
  fromStation?: { name: string; departureTime: Date | string };
  toStation?: { name: string; departureTime: Date | string };
};

type TripBookingsProps = {
  bookings: Booking[];
};

export const TripBookings = ({ bookings }: TripBookingsProps) => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState('');

  const TRIP_BOOKING_HEADERS = [
    t('common.table.passenger'),
    t('trips.details.route'),
    t('common.table.departure'),
    t('common.table.arrival'),
    t('common.table.seat'),
    t('common.table.status'),
    t('common.table.total'),
    t('common.table.action'),
  ];

  // Client-side filtering
  const filteredBookings = bookings.filter((booking) => {
    const q = query.toLowerCase();
    return (
      booking.passenger?.fullName?.toLowerCase().includes(q) ||
      booking.passenger?.email?.toLowerCase().includes(q) ||
      booking.id.toLowerCase().includes(q)
    );
  });

  // Client-side pagination
  const total = filteredBookings.length;
  const pages = Math.ceil(total / limit);
  const paginatedBookings = filteredBookings.slice((page - 1) * limit, page * limit);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  return (
    <Card className="h-full w-full rounded-2xl shadow">
      <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="size-5 text-primary" />
            {t('common.navigation.bookings')}
          </CardTitle>
          <CardDescription>{t('trips.details.manageBookings')}</CardDescription>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="w-full space-y-4">
            <SearchInput
              onChange={(e) => handleQueryChange(e.currentTarget.value)}
              onRefresh={() => undefined}
              placeholder={t('trips.details.searchPassenger')}
              value={query}
            />
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {TRIP_BOOKING_HEADERS.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="fade-in animate-in duration-200">
                  {paginatedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {booking.passenger?.fullName || t('common.status.unnumbered')}
                          </span>
                          <span className="text-muted-foreground text-xs">{booking.passenger?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.fromStation?.name} → {booking.toStation?.name}
                      </TableCell>
                      <TableCell>{dayjs(booking.fromStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{dayjs(booking.toStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{booking.seat?.number ?? t('common.status.unnumbered')}</TableCell>
                      <TableCell>
                        <Status s={booking.status} />
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(booking.total)}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/bookings/${booking.id}`}>{t('common.view')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedBookings.length === 0 && (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={TRIP_BOOKING_HEADERS.length}>
                        {t('common.pagination.noResults')}
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
              onPageChange={setPage}
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
              <EmptyTitle>{t('trips.details.noBookings')}</EmptyTitle>
              <EmptyDescription>{t('trips.details.noBookingsDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
};
