'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@repo/design-system/web/src/components/ui/badge';
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
import { AgencyManagerStatus } from '@repo/shared/constants';
import { User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useDebounce } from 'react-use';
import { DeleteAgencyManagerDialog } from '@/components/agency-managers/delete-agency-manager-dialog';
import { NewAgencyManager } from '@/components/agency-managers/new-agency-manager';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { UpdateAgencyManager } from '@/components/agency-managers/update-agency-manager';
import { useListAgencyManagers, type AgencyManager } from '@/features/agency-managers/api/use-list-agency-managers';

const statusClasses: Record<string, string> = {
  [AgencyManagerStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50/80',
  [AgencyManagerStatus.INACTIVE]: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50/80',
  DEFAULT: 'bg-muted text-muted-foreground hover:bg-muted/80',
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const t = useTranslations('agencyOwner');
  const currentStatus = status ?? 'DEFAULT';
  const label = currentStatus === AgencyManagerStatus.ACTIVE ? t('statusActive') : t('statusInactive');

  return (
    <Badge className={`${statusClasses[currentStatus] ?? statusClasses.DEFAULT} font-medium capitalize`} variant="outline">
      {label}
    </Badge>
  );
};

export const AgencyManagers = () => {
  const t = useTranslations('agencyOwner');
  const headers = [
    t('table.name'),
    t('table.phone'),
    t('table.email'),
    t('table.agency'),
    t('table.status'),
    t('table.action'),
  ];

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState('status', parseAsStringEnum<AgencyManagerStatus>(Object.values(AgencyManagerStatus)));

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
      label: t('filter.status'),
      options: [
        {
          label: t('filter.all'),
          value: undefined,
        },
        {
          label: t('filter.active'),
          value: AgencyManagerStatus.ACTIVE,
        },
        {
          label: t('filter.inactive'),
          value: AgencyManagerStatus.INACTIVE,
        },
      ],
      selected: status ?? undefined,
      type: 'radio',
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListAgencyManagers({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    status: status || undefined,
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('listTitle')}</h1>
          <NewAgencyManager />
        </div>
          <p className="text-primary">{t('listDescription')}</p>
      </div>

      <SearchInput
        filter={filterList}
        onChangeAction={(e: any) => setQuery(e.currentTarget.value)}
        onRefreshAction={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('searchPlaceholder')}
        setFilterAction={(newFilter: any) => {
          if ('status' in newFilter) {
            setStatus((newFilter.status as AgencyManagerStatus) || null);
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
                {data.data.map((manager: AgencyManager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      {manager.user.profile?.firstName} {manager.user.profile?.lastName}
                    </TableCell>
                    <TableCell>{manager.user.profile?.phoneNumber}</TableCell>
                    <TableCell>{manager.user.email}</TableCell>
                    <TableCell>{manager.agency?.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={manager.status} />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <UpdateAgencyManager id={manager.id} />
                      <DeleteAgencyManagerDialog managerId={manager.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit}
            onLimitChangeAction={(newLimit: any) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChangeAction={(newPage: any) => setPage(newPage)}
            page={data.pagination.page}
            total={data.pagination.total}
            totalPages={data.pagination.pages}
          />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User2 />
            </EmptyMedia>
            <EmptyTitle>{t('noAgencyOwners')}</EmptyTitle>
            <EmptyDescription>{t('noAgencyOwnersDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
