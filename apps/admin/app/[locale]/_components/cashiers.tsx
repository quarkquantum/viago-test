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
import { CashierStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { UserSquare } from 'lucide-react';
import Link from 'next/link';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewCashier } from '@/components/cashier/new-cashier';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type CashierType, useListCashiers } from '@/features/cashiers/api/use-list-cashiers';

import { useTranslations } from 'next-intl';

const HEADERS_KEYS = ['table.name', 'table.phone', 'table.agency', 'table.status', 'table.createdAt', 'table.action'];

export const Cashiers = () => {
  const t = useTranslations('cashiers');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState('status', parseAsStringEnum<CashierStatus>(Object.values(CashierStatus)));

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
          label: tc('status.active'),
          value: CashierStatus.ACTIVE,
        },
        {
          label: tc('status.inactive'),
          value: CashierStatus.INACTIVE,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListCashiers({
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
          <NewCashier />
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
            setStatus((newFilter.status as CashierStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable header={HEADERS_KEYS.map((key) => tc(key))} rows={5} />
      ) : data && data.data.length > 0 ? (
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
                {data.data.map((cashier: CashierType) => (
                  <TableRow key={cashier.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cashier.user?.fullName ?? '-'}</span>
                        <span className="text-muted-foreground text-xs">{cashier.user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{cashier.user?.profile?.phoneNumber ?? '-'}</TableCell>
                    <TableCell>{cashier.agency?.name}</TableCell>
                    <TableCell>
                      <Status s={cashier.user?.banned ? 'BANNED' : 'ACTIVE'} />
                    </TableCell>
                    <TableCell>{dayjs(cashier.createdAt).format('ddd, D MMM YYYY, HH:mm')}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/cashiers/${cashier.id}`}>{tc('view')}</Link>
                      </Button>
                    </TableCell>
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
              <UserSquare />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
