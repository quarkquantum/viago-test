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
import { useLocale, useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Agencies, useGetAgencies } from '@/features/agencies/api/use-get-agencies';
import { Link } from '@/i18n/routing';

export const AgenciesTable = () => {
  const t = useTranslations();
  const locale = useLocale();
  const headers = [
    t('agencies.table.logo'),
    t('agencies.table.name'),
    t('agencies.table.description'),
    t('agencies.table.slug'),
    t('agencies.table.status'),
    t('agencies.table.createdAt'),
    t('agencies.table.action'),
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
      label: t('agencies.table.status'),
      options: [
        {
          label: t('agencies.table.all'),
          value: '',
        },
        {
          label: t('common.status.active'),
          value: AgencyStatus.ACTIVE,
        },
        {
          label: t('common.status.inactive'),
          value: AgencyStatus.INACTIVE,
        },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useGetAgencies({
    page: page.toString(),
    limit: limit.toString(),
    q: q || undefined,
    ...(status ? { status: status as AgencyStatus } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <SearchInput
        filter={filterList}
        onChangeAction={(e) => setQuery(e.currentTarget.value)}
        onRefreshAction={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('agencies.searchPlaceholder')}
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
                {data.data.map((agency: Agencies) => (
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
                      <div className="max-w-72 truncate">{agency.description || '-'}</div>
                    </TableCell>
                    <TableCell>{agency.slug}</TableCell>
                    <TableCell>
                      <Status s={agency.status} />
                    </TableCell>
                    <TableCell>{dayjs(agency.createdAt).locale(locale).format('ddd, D MMM YYYY, HH:mm')}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/agencies/${agency.slug}`}>{t('agencies.table.view')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit ?? 10}
            onLimitChangeAction={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChangeAction={(newPage) => setPage(newPage)}
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
            <EmptyTitle>{t('agencies.table.noAgencies')}</EmptyTitle>
            <EmptyDescription>{t('agencies.table.noAgenciesDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
