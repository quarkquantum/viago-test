'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/web/src/components/ui/avatar';
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
import { AgencyStatus } from '@repo/shared/constants';
import dayjs from 'dayjs';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Agencies as AgencyType, useListAgencies } from '@/features/agencies/api/use-list-agencies';

const HEADERS_KEYS = [
  'table.logo',
  'table.name',
  'table.description',
  'table.owner',
  'table.status',
  'table.createdAt',
  'table.action',
];

export const Agencies = () => {
  const t = useTranslations('agencies');
  const tc = useTranslations('common');
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
      label: tc('status.label'),
      options: [
        {
          label: tc('status.all'),
          value: undefined,
        },
        {
          label: tc('status.active'),
          value: AgencyStatus.ACTIVE,
        },
        {
          label: tc('status.inactive'),
          value: AgencyStatus.INACTIVE,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListAgencies({
    page: page.toString(),
    limit: limit.toString(),
    q: q || undefined,
    ...(status ? { status } : {}),
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="font-bold text-2xl">{t('list.title')}</h1>
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
            setStatus((newFilter.status as AgencyStatus) || null);
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
                {data.data.map((agency: AgencyType) => (
                  <TableRow key={agency.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={agency.logo || undefined} />
                        <AvatarFallback>
                          <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell>
                      <div className="max-w-72 truncate">{agency.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{agency.owner?.fullName ?? '-'}</span>
                        <span className="text-muted-foreground text-xs">{agency.owner?.email ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Status s={agency.status} />
                    </TableCell>
                    <TableCell>{dayjs(agency.createdAt).format('ddd, D MMM YYYY, HH:mm')}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/agencies/${agency.slug}`}>{tc('view')}</Link>
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
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
