'use client';
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
import { SubscriptionStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Receipt } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import {
  type SubscriptionType,
  useListSubscriptions,
} from '@/features/billing/api/use-list-subscriptions';
import { useTranslations } from 'next-intl';

const HEADER_KEYS = [
  'table.agency',
  'table.status',
  'table.trialStart',
  'table.trialEnd',
  'table.remaining',
  'table.invoices',
];

export const Billing = () => {
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum<SubscriptionStatus>(Object.values(SubscriptionStatus))
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
      label: t('table.status'),
      options: [
        { label: tc('status.all'), value: undefined },
        { label: t('status.trial'), value: SubscriptionStatus.TRIAL },
        { label: t('status.active'), value: SubscriptionStatus.ACTIVE },
        { label: t('status.expired'), value: SubscriptionStatus.EXPIRED },
        { label: t('status.cancelled'), value: SubscriptionStatus.CANCELLED },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListSubscriptions({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    ...(status ? { status } : {}),
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="font-bold text-2xl">{t('title')}</h1>
        <p className="text-primary">{t('description')}</p>
      </div>

      <SearchInput
        filter={filterList}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('searchPlaceholder')}
        setFilter={(newFilter) => {
          if ('status' in newFilter) {
            setStatus((newFilter.status as SubscriptionStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />

      {isLoading ? (
        <SkeletonTable header={HEADER_KEYS.map((key) => t(key))} rows={5} />
      ) : data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADER_KEYS.map((key) => (
                    <TableHead key={key}>{t(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((sub: SubscriptionType) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sub.agency.name}</span>
                        <span className="text-muted-foreground text-xs">{sub.agency.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Status s={sub.status} />
                    </TableCell>
                    <TableCell>{dayjs(sub.trialStartDate).format('D MMM YYYY')}</TableCell>
                    <TableCell>{dayjs(sub.trialEndDate).format('D MMM YYYY')}</TableCell>
                    <TableCell>
                      {sub.isTrialExpired ? (
                        <span className="text-destructive text-sm">{t('trialExpired')}</span>
                      ) : (
                        <span className="font-medium text-sm">
                          {t('days', { count: sub.remainingDays })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{sub.invoiceCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit ?? 10}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChange={(newPage) => setPage(newPage)}
            page={data.pagination.page ?? 1}
            total={data.pagination.total ?? 0}
            totalPages={data.pagination.pages ?? 1}
          />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>{t('empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};