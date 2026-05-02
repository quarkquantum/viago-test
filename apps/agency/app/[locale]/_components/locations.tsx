'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Empty,
  EmptyContent,
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
import { Building2, Plus } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { useTranslations } from 'next-intl';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { useListLocations } from '@/features/locations/api/use-list-locations';
import { CreateLocationDialog } from './create-location-dialog';

const HEADER_KEYS = [
  'table.name',
  'table.city',
  'table.address',
  'table.members',
  'table.trips',
  'table.status',
  'table.action',
];

export const Locations = () => {
  const t = useTranslations('locations');
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

  const { data, isLoading, refetch } = useListLocations({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('title')}</h1>
          <CreateLocationDialog onSuccess={() => refetch()} />
        </div>
        <p className="text-primary">{t('description')}</p>
      </div>

      <SearchInput
        onChange={(e) => setQuery(e.currentTarget.value)}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('searchPlaceholder')}
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
                {data.data.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.city.name}</TableCell>
                    <TableCell>{location.address || '-'}</TableCell>
                    <TableCell>{location._count.members}</TableCell>
                    <TableCell>{location._count.trips}</TableCell>
                    <TableCell>
                      <Status s={location.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <a href={`/locations/${location.id}`}>{tc('view')}</a>
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
            <EmptyTitle>{t('empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateLocationDialog onSuccess={() => refetch()} />
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
};
