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
import { AgencyStatus } from '@repo/shared';
import { Bus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewDriver } from '@/components/driver/new-driver';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Driver, useListDrivers } from '@/features/drivers/api/use-list-drivers';
import { Link } from '@/i18n/routing';

export const Drivers = () => {
  const t = useTranslations();
  const headers = [
    t('drivers.table.name'),
    t('drivers.table.phone'),
    t('drivers.table.email'),
    t('drivers.table.trips'),
    t('drivers.table.status'),
    t('drivers.table.action'),
  ];

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState('status', parseAsStringEnum<AgencyStatus>(Object.values(AgencyStatus)));

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
      label: t('drivers.filter.status'),
      options: [
        { label: t('drivers.filter.all'), value: undefined },
        { label: t('drivers.filter.active'), value: AgencyStatus.ACTIVE },
        { label: t('drivers.filter.inactive'), value: AgencyStatus.INACTIVE },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListDrivers({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    ...(status ? { status } : {}),
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('drivers.listTitle')}</h1>
          <NewDriver />
        </div>
        <p className="text-primary">{t('drivers.listDescription')}</p>
      </div>

      <SearchInput
        filter={filterList}
        onChangeAction={(e) => setQuery(e.currentTarget.value)}
        onRefreshAction={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('drivers.searchPlaceholder')}
        setFilterAction={(newFilter) => {
          if ('status' in newFilter) {
            setStatus((newFilter.status as AgencyStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />
      {isLoading ? (
        <SkeletonTable header={headers} rows={5} />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
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
                {data.data.map((driver: Driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.user.fullName}</TableCell>
                    <TableCell>{driver.user.profile?.phoneNumber}</TableCell>
                    <TableCell>{driver.user.email}</TableCell>
                    <TableCell>{driver.trips.length}</TableCell>
                    <TableCell>
                      <Status s={driver.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/drivers/${driver.id}`}>{t('drivers.table.view')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit}
            onLimitChangeAction={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChangeAction={(newPage) => setPage(newPage)}
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
            <EmptyTitle>{t('drivers.noDrivers')}</EmptyTitle>
            <EmptyDescription>{t('drivers.noDriversDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
