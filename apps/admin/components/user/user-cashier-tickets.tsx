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
import type { Ticket } from '@/features/cashiers/api/use-get-cashier';

type CashierTicketsProps = {
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

export const CashierTickets = ({
  tickets,
  pagination,
  query,
  onQueryChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}: CashierTicketsProps) => {
  const tUsers = useTranslations('users.cashierTickets');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const headers = [
    tCommon('table.passenger'),
    tCommon('table.trip'),
    tCommon('table.departure'),
    tCommon('table.licensePlate'),
    tCommon('table.seat'),
    tCommon('status.label'),
    tCommon('table.price'),
    tCommon('table.action'),
  ];

  return (
    <div className="space-y-4">
      <Card className="w-full rounded-2xl shadow">
        <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="size-5 text-primary" />
              {tUsers('title')}
            </CardTitle>
            <CardDescription>{tUsers('description')}</CardDescription>
          </div>
          {tickets && tickets.length > 0 ? (
            <div className="w-full space-y-4">
              <SearchInput
                onChange={(e) => onQueryChange(e.currentTarget.value)}
                onRefresh={onRefresh}
                placeholder={tUsers('searchPlaceholder')}
                value={query}
              />
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="fade-in animate-in duration-200">
                    {tickets.map((ticket: Ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{ticket.booking?.passenger?.fullName ?? '-'}</span>
                            <span className="text-muted-foreground text-xs">
                              {ticket.booking?.passenger?.email ?? '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.booking?.trip?.name ?? '-'}</TableCell>
                        <TableCell>
                          {ticket.booking?.trip?.departureTime
                            ? dayjs(ticket.booking.trip.departureTime).locale(locale).format('ddd, D MMM YYYY HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>{ticket.booking?.trip?.bus?.licensePlate ?? '-'}</TableCell>
                        <TableCell>{ticket.booking.seat.number ?? tUsers('unassigned')}</TableCell>
                        <TableCell>
                          <Status s={ticket.status} />
                        </TableCell>
                        <TableCell>{ticket.booking.total}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/tickets/${ticket.id}`}>{tCommon('view')}</Link>
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
                <EmptyTitle>{tUsers('empty.title')}</EmptyTitle>
                <EmptyDescription>{tUsers('empty.description')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
