'use client';
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
import { Separator } from '@repo/design-system/web/src/components/ui/separator';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
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
import { Calendar, Mail, Phone, Ticket, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { Status } from '@/components/status';
import { useGetPassenger } from '@/features/passengers/api/use-get-passenger';
import { formatCurrency } from '@/helpers/format-currency';

export const Passenger = () => {
  const t = useTranslations('passenger');
  const params = useParams();
  const id = params.id as string;
  const { data: passenger, isLoading } = useGetPassenger(id);

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(5));
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
      label: t('common.status.label'),
      options: [
        { label: t('common.status.all'), value: undefined },
        { label: t('common.status.issued'), value: TicketStatus.ISSUED },
        { label: t('common.status.refunded'), value: TicketStatus.REFUNDED },
        { label: t('common.status.cancelled'), value: TicketStatus.CANCELLED },
        { label: t('common.status.expired'), value: TicketStatus.EXPIRED },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const filteredTickets = useMemo(() => {
    if (!passenger || 'message' in passenger || !passenger.tickets) {
      return [];
    }
    let tickets = [...passenger.tickets];

    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status);
    }

    if (q) {
      const lowerQ = q.toLowerCase();
      tickets = tickets.filter(
        (ticket) =>
          ticket.booking?.trip?.name?.toLowerCase().includes(lowerQ) ||
          ticket.booking?.trip?.description?.toLowerCase().includes(lowerQ) ||
          ticket.seat?.number?.toString().toLowerCase().includes(lowerQ)
      );
    }
    return tickets;
  }, [passenger, status, q]);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTickets.slice(start, start + limit);
  }, [filteredTickets, page, limit]);

  const totalPages = Math.ceil(filteredTickets.length / limit);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!passenger || 'message' in passenger) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>{t('notFound.title')}</EmptyTitle>
            <EmptyDescription>{t('notFound.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/tickets">{t('common.backToTickets')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }
  const passengerData = passenger;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <h1 className="font-bold text-2xl">{t('profile.title')}</h1>
        <p className="text-primary">{t('profile.description')}</p>
      </div>

      {/* Passenger Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                {t('profile.personalInfo.title')}
              </CardTitle>
              <CardDescription>{t('profile.personalInfo.description')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.personalInfo.fullName')}</p>
                <p className="truncate font-medium">{passengerData.fullName || passengerData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.personalInfo.email')}</p>
                <p className="truncate font-medium">{passengerData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.personalInfo.phone')}</p>
                <p className="font-medium">{passengerData.profile?.phoneNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="size-5" />
                {t('profile.accountDetails.title')}
              </CardTitle>
              <CardDescription>{t('profile.accountDetails.description')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Ticket className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.accountDetails.totalTickets')}</p>
                <p className="font-medium">{passengerData?.tickets?.length || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.accountDetails.memberSince')}</p>
                <p className="font-medium">{dayjs(passengerData.createdAt).format('MMM D, YYYY')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('profile.accountDetails.status')}</p>
                <p className="font-medium">
                  {passengerData.emailVerified ? t('common.status.verified') : t('common.status.notVerified')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Ticket History */}
      <div className="space-y-4">
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-bold text-xl">{t('profile.history.title')}</h2>
                <p className="text-muted-foreground text-sm">{t('profile.history.description')}</p>
              </div>
            </div>

            <SearchInput
              filter={filterList}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onRefresh={() => {
                setPage(1);
                // refetch if supported or just reset client state
              }}
              placeholder={t('common.search')}
              setFilter={(newFilter) => {
                if ('status' in newFilter) {
                  setStatus((newFilter.status as TicketStatus) || null);
                  setPage(1);
                }
              }}
              value={query}
            />

            {paginatedTickets.length > 0 ? (
              <div className="space-y-4">
                <div className="fade-in animate-in overflow-hidden overflow-y-auto rounded-md border duration-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.table.trip')}</TableHead>
                        <TableHead>{t('common.table.description')}</TableHead>
                        <TableHead>{t('common.table.status')}</TableHead>
                        <TableHead>{t('common.table.seat')}</TableHead>
                        <TableHead>{t('common.table.price')}</TableHead>
                        <TableHead>{t('common.table.createdAt')}</TableHead>
                        <TableHead>{t('common.table.action')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.booking?.trip?.name || '-'}</TableCell>
                          <TableCell>{ticket.booking?.trip?.description || '-'}</TableCell>
                          <TableCell>
                            <Status s={ticket.status ?? 'DEFAULT'} />
                          </TableCell>
                          <TableCell>{ticket.seat?.number ?? '-'}</TableCell>
                          <TableCell>{formatCurrency(ticket.booking?.total ?? 0)}</TableCell>
                          <TableCell>{dayjs(ticket.createdAt).format('ddd, D MMM YYYY HH:mm')}</TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/tickets/${ticket.id}`}>{t('common.view')}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationMenu
                  limit={limit}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  onPageChange={setPage}
                  page={page}
                  total={filteredTickets.length}
                  totalPages={totalPages}
                />
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Ticket />
                  </EmptyMedia>
                  <EmptyTitle>{t('common.empty.noTickets')}</EmptyTitle>
                  <EmptyDescription>{t('empty.description')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
