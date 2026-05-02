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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import dayjs from 'dayjs';
import { TicketIcon } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { Status } from '@/components/status';
import type { Ticket } from '@/features/passengers/api/use-get-passenger';

const PASSENGER_TICKET_HEADERS_KEYS = ['trip', 'departure', 'licensePlate', 'seat', 'status', 'price', 'action'];

type PassengerTicketsProps = {
  tickets: Ticket[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
  query: string;
  onQueryChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
};

export const PassengerTickets = ({
  tickets,
  pagination,
  query,
  onQueryChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}: PassengerTicketsProps) => {
  const t = useTranslations('passengers');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <Card className="w-full rounded-2xl shadow">
        <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="size-5 text-primary" />
              {t('details.ticketHistory')}
            </CardTitle>
            <CardDescription>{t('details.ticketHistoryDescription')}</CardDescription>
          </div>
          {tickets && tickets.length > 0 ? (
            <div className="w-full space-y-4">
              <SearchInput
                onChange={(e) => onQueryChange(e.currentTarget.value)}
                onRefresh={onRefresh}
                placeholder={tc('search')}
                value={query}
              />
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {PASSENGER_TICKET_HEADERS_KEYS.map((key) => (
                        <TableHead key={key}>{tc(`table.${key}`)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="fade-in animate-in duration-200">
                    {tickets.map((ticket: Ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.booking?.trip?.name ?? '-'}</TableCell>
                        <TableCell>
                          {ticket.booking?.trip?.departureTime
                            ? dayjs(ticket.booking.trip.departureTime).locale(locale).format('ddd, D MMM YYYY HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>{ticket.booking?.trip?.bus?.licensePlate ?? '-'}</TableCell>
                        <TableCell>{ticket.seat?.number ?? tc('empty.noData')}</TableCell>
                        <TableCell>
                          <Status s={ticket.status} />
                        </TableCell>
                        <TableCell>{ticket.booking?.total}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/tickets/${ticket.id}`}>{tc('view')}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationMenu
                limit={pagination.limit}
                onLimitChange={onLimitChange}
                onPageChange={onPageChange}
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.pages}
              />
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TicketIcon />
                </EmptyMedia>
                <EmptyTitle>{t('details.noTicketsHistory')}</EmptyTitle>
                <EmptyDescription>{t('details.noTicketsDescription')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
