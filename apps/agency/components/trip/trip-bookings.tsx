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
import { useState } from 'react';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { Status } from '@/components/status';
import { formatCurrency } from '@/helpers/format-currency';

const TRIP_BOOKING_HEADERS = ['Passenger', 'Route', 'Departure', 'Arrival', 'Seat', 'Status', 'Total', 'Action'];

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState('');

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
            Bookings
          </CardTitle>
          <CardDescription>Manage bookings for this trip</CardDescription>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="w-full space-y-4">
            <SearchInput
              onChange={(e) => handleQueryChange(e.currentTarget.value)}
              onRefresh={() => handleQueryChange('')}
              placeholder="Search passenger..."
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
                          <span className="font-medium text-sm">{booking.passenger?.fullName || 'Unknown'}</span>
                          <span className="text-muted-foreground text-xs">{booking.passenger?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.fromStation?.name} → {booking.toStation?.name}
                      </TableCell>
                      <TableCell>{dayjs(booking.fromStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{dayjs(booking.toStation?.departureTime).format('ddd, D MMM HH:mm')}</TableCell>
                      <TableCell>{booking.seat?.number ?? 'Unassigned'}</TableCell>
                      <TableCell>
                        <Status s={booking.status} />
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(booking.total)}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/bookings/${booking.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedBookings.length === 0 && (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={TRIP_BOOKING_HEADERS.length}>
                        No results found.
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
              <EmptyTitle>No bookings found</EmptyTitle>
              <EmptyDescription>There are no bookings available at the moment. Check back later.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
};
