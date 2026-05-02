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
import { Bus } from 'lucide-react';
import Link from 'next/link';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewDriver } from '@/components/driver/new-driver';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { type Driver, useListDrivers } from '@/features/drivers/api/use-list-drivers';

import { useTranslations } from 'next-intl';

const HEADERS_KEYS = ['table.name', 'table.phone', 'table.email', 'navigation.trips', 'table.action'];

export const Drivers = () => {
  const t = useTranslations('drivers');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
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

  const { data, isLoading, refetch } = useListDrivers({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewDriver />
        </div>
        <p className="text-primary">{t('list.description')}</p>
      </div>

      <SearchInput
        onChange={(e) => setQuery(e.currentTarget.value)}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('list.searchPlaceholder')}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable
          header={HEADERS_KEYS.map((key) =>
            key.startsWith('navigation.') || key.startsWith('table.') ? tc(key) : t(key)
          )}
          rows={5}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS_KEYS.map((key) => (
                    <TableHead key={key}>
                      {key.startsWith('navigation.') || key.startsWith('table.') ? tc(key) : t(key)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((driver: Driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.user.fullName}</TableCell>
                    <TableCell>{driver.user.profile?.phoneNumber}</TableCell>
                    <TableCell>{driver.user.email}</TableCell>
                    <TableCell>{driver.trips.length}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/drivers/${driver.id}`}>{tc('view')}</Link>
                      </Button>
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
              <Bus />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
