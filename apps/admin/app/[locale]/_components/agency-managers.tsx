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
import { AgencyManagerStatus } from '@repo/shared';
import { UserCog } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { NewAgencyManager } from '@/components/agency-manager/new-agency-manager';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import {
  type AgencyManagerType,
  useListAgencyManagers,
} from '@/features/agency-managers/api/use-list-agency-managers';
import dayjs from 'dayjs';

const HEADERS_KEYS = ['table.fullName', 'table.email', 'table.phoneNumber', 'table.agency', 'table.status', 'table.createdAt'];

export const AgencyManagers = () => {
  const t = useTranslations('agencyManagers');
  const tc = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum(Object.values(AgencyManagerStatus) as string[])
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
      label: tc('status.label'),
      options: [
        { label: tc('status.all'), value: undefined },
        { label: tc('status.active'), value: AgencyManagerStatus.ACTIVE },
        { label: tc('status.inactive'), value: AgencyManagerStatus.INACTIVE },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListAgencyManagers({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    status: status || undefined,
  });

  const managers = data?.data;

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewAgencyManager />
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
            setStatus((newFilter.status as AgencyManagerStatus) || null);
            setPage(1);
          }
        }}
        value={query}
      />

      {isLoading ? (
        <SkeletonTable header={HEADERS_KEYS.map((key) => tc(key))} rows={5} />
      ) : managers && managers.length > 0 ? (
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
                {managers.map((manager: AgencyManagerType) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.user?.fullName ?? '-'}</TableCell>
                    <TableCell>{manager.user?.email ?? '-'}</TableCell>
                    <TableCell>{manager.user?.profile?.phoneNumber ?? '-'}</TableCell>
                    <TableCell>
                      <Button asChild className="h-auto p-0" variant="link">
                        <Link href={`/agencies/${manager.agency?.slug}`}>{manager.agency?.name ?? '-'}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Status s={manager.user?.banned ? 'BANNED' : 'ACTIVE'} />
                    </TableCell>
                    <TableCell>{dayjs(manager.createdAt).format('D MMM YYYY')}</TableCell>
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
              <UserCog />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
