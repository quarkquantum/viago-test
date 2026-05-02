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
import { Ticket } from 'lucide-react';
import Link from 'next/link';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { NewTicket } from '@/components/ticket/new-ticket';
import { type Ticket as TicketType, useListTickets } from '@/features/tickets/api/use-list-tickets';
import { formatCurrency } from '@/helpers/format-currency';

import { useTranslations } from 'next-intl';

const HEADERS_KEYS = [
  'table.passenger',
  'table.trip',
  'table.status',
  'table.seat',
  'table.price',
  'table.createdAt',
  'table.action',
];

export const Tickets = () => {
  const t = useTranslations('tickets');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');
  const [status, setStatus] = useQueryState('status', parseAsStringEnum<TicketStatus>(Object.values(TicketStatus)));

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
      label: tc('status.label'),
      options: [
        {
          label: tc('status.all'),
          value: undefined,
        },
        {
          label: tc('status.issued'),
          value: TicketStatus.ISSUED,
        },
        {
          label: tc('status.refunded'),
          value: TicketStatus.REFUNDED,
        },
        {
          label: tc('status.cancelled'),
          value: TicketStatus.CANCELLED,
        },
        {
          label: tc('status.expired'),
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
    q: q || undefined,
    ...(status ? { status } : {}),
  });

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewTicket />
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
        <SkeletonTable header={HEADERS_KEYS.map((key) => tc(key))} rows={5} />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS_KEYS.map((key) => (
                    <TableHead key={key}>{tc(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((ticket: TicketType) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{ticket?.passenger?.fullName ?? '-'}</span>
                        <span className="text-muted-foreground text-xs">{ticket?.passenger?.email ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.booking.trip.name ?? '-'}</TableCell>
                    <TableCell>
                      <Status s={ticket.status ?? 'DEFAULT'} />
                    </TableCell>
                    <TableCell>{ticket.seat?.number ?? '-'}</TableCell>
                    <TableCell>{formatCurrency(ticket.booking.total)}</TableCell>
                    <TableCell>{dayjs(ticket.createdAt).format('ddd, D MMM YYYY HH:mm')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/tickets/${ticket.id}`}>{tc('view')}</Link>
                        </Button>
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
              <Ticket />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      )}
    </div>
  );
};
