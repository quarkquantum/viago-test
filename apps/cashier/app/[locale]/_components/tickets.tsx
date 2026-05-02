'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
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
import { TicketStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Ticket as TicketIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { DeleteTicketDialog } from '@/components/ticket/delete-ticket-dialog';
import { TicketActions } from '@/components/ticket/ticket-actions';
import { useListTickets } from '@/features/tickets/api/use-list-tickets';
import { formatCurrency } from '@/helpers/format-currency';

export const Tickets = () => {
  const t = useTranslations('tickets');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<TicketStatus>(Object.values(TicketStatus)));

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
      label: t('list.status.label'),
      options: [
        {
          label: t('list.status.all'),
          value: undefined,
        },
        {
          label: t('list.status.issued'),
          value: TicketStatus.ISSUED,
        },
        {
          label: t('list.status.refunded'),
          value: TicketStatus.REFUNDED,
        },
        {
          label: t('list.status.cancelled'),
          value: TicketStatus.CANCELLED,
        },
        {
          label: t('list.status.expired'),
          value: TicketStatus.EXPIRED,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];
  const { data, isLoading, refetch } = useListTickets({
    limit: limit.toString(),
    page: page.toString(),
    q,
    ...(status ? { status } : {}),
  });
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
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
            setStatus((newFilter.status as TicketStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable
          header={[
            t('common.table.passenger'),
            t('common.table.from'),
            t('common.table.to'),
            t('common.table.status'),
            t('common.table.seat'),
            t('common.table.price'),
            t('common.table.createdAt'),
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
                  <TableHead>{t('common.table.passenger')}</TableHead>
                  <TableHead>{t('common.table.from')}</TableHead>
                  <TableHead>{t('common.table.to')}</TableHead>
                  <TableHead>{t('common.table.status')}</TableHead>
                  <TableHead>{t('common.table.seat')}</TableHead>
                  <TableHead>{t('common.table.price')}</TableHead>
                  <TableHead>{t('common.table.createdAt')}</TableHead>
                  <TableHead>{t('common.table.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.passenger.fullName ?? '-'}</TableCell>
                    <TableCell>{ticket.booking.fromStation.name ?? '-'}</TableCell>
                    <TableCell>{ticket.booking.toStation.name ?? '-'}</TableCell>
                    <TableCell>
                      <Status s={ticket.status ?? 'DEFAULT'} />
                    </TableCell>
                    <TableCell>{ticket.seat?.number ?? '-'}</TableCell>
                    <TableCell>{formatCurrency(ticket.booking.total ?? 0)}</TableCell>
                    <TableCell>{dayjs(ticket.createdAt).format('ddd, D MMM YYYY HH:mm')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TicketActions ticketId={ticket.id} status={ticket.status} ticketKey={ticket.key} />
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/tickets/${ticket.id}`}>{t('common.view')}</Link>
                        </Button>
                        <DeleteTicketDialog ticketId={ticket.id} />
                      </div>
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
              <TicketIcon />
            </EmptyMedia>
            <EmptyTitle>{t('common.empty.noTickets')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      )}
    </div>
  );
};
