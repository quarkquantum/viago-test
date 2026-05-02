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
import { AgencyRequestStatus } from '@repo/shared/constants';
import dayjs from 'dayjs';
import { ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { useApproveAgencyRequest } from '@/features/agency-requests/api/use-approve-agency-request';
import {
  type AgencyRequest,
  useListAgencyRequests,
} from '@/features/agency-requests/api/use-list-agency-requests';
import { useRejectAgencyRequest } from '@/features/agency-requests/api/use-reject-agency-request';

const HEADERS_KEYS = [
  'table.agencyName',
  'table.legalForm',
  'table.fullName',
  'table.email',
  'table.phone',
  'table.status',
  'table.createdAt',
  'table.actions',
];

export const AgencyRequests = () => {
  const t = useTranslations('agencyRequests');
  const tc = useTranslations('common');
  const legalFormLabel = (value?: string) => {
    if (!value) {
      return '—';
    }
    const map: Record<string, string> = {
      SARL: 'legalFormOptions.sarl',
      SA: 'legalFormOptions.sa',
      GIE: 'legalFormOptions.gie',
      ENTREPRISE_INDIVIDUELLE: 'legalFormOptions.ei',
    };
    const key = map[value];
    return key ? tc(key) : value;
  };
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum<AgencyRequestStatus>(Object.values(AgencyRequestStatus))
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
        { label: tc('status.pending'), value: AgencyRequestStatus.PENDING },
        { label: t('status.approved'), value: AgencyRequestStatus.APPROVED },
        { label: t('status.rejected'), value: AgencyRequestStatus.REJECTED },
      ],
      selected: status ?? undefined,
      type: 'radio' as const,
      value: 'status',
    },
  ];

  const { data, isLoading, refetch } = useListAgencyRequests({
    page: page.toString(),
    limit: limit.toString(),
    q: q || undefined,
    ...(status ? { status } : {}),
  });

  const { mutate: approve, isPending: isApproving } = useApproveAgencyRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectAgencyRequest();

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
            setStatus((newFilter.status as AgencyRequestStatus) || null);
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
                {data.data.map((request: AgencyRequest) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.agencyName}</TableCell>
                    <TableCell>{legalFormLabel(request.legalForm)}</TableCell>
                    <TableCell>
                      {request.firstName} {request.lastName}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.phoneNumber}</TableCell>
                    <TableCell>
                      <Status s={request.status} />
                    </TableCell>
                    <TableCell>{dayjs(request.createdAt).format('ddd, D MMM YYYY, HH:mm')}</TableCell>
                    <TableCell>
                      {request.status === AgencyRequestStatus.PENDING && (
                        <div className="flex gap-1">
                          <Button
                            disabled={isApproving || isRejecting}
                            onClick={() => approve(request.id)}
                            size="sm"
                            variant="default"
                          >
                            {t('actions.approve')}
                          </Button>
                          <Button
                            disabled={isApproving || isRejecting}
                            onClick={() => reject({ identifier: request.id })}
                            size="sm"
                            variant="destructive"
                          >
                            {t('actions.reject')}
                          </Button>
                        </div>
                      )}
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
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
