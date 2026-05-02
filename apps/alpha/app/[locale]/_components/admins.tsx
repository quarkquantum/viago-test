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
import { SystemRoles } from '@repo/shared';
import { User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import { useDebounce } from 'react-use';
import { NewAdmin } from '@/components/admin/new-admin';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { Status } from '@/components/status';
import { type Admin, useListAdmins } from '@/features/admins/api/use-list-admins';
import { Link } from '@/i18n/routing';

const roleClasses: Record<string, string> = {
  [SystemRoles.ADMIN]: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50/80',
  [SystemRoles.SUPER_ADMIN]: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50/80',
  DEFAULT: 'bg-muted text-muted-foreground hover:bg-muted/80',
};

const RoleBadge = ({ role }: { role: string | null }) => {
  const t = useTranslations('admins.roles');
  const currentRole = role ?? 'DEFAULT';

  const label =
    currentRole === SystemRoles.ADMIN
      ? t('admin')
      : currentRole === SystemRoles.SUPER_ADMIN
        ? t('superAdmin')
        : currentRole;

  return (
    <Badge className={`${roleClasses[currentRole] ?? roleClasses.DEFAULT} font-medium capitalize`} variant="outline">
      {label}
    </Badge>
  );
};

export const Admins = () => {
  const t = useTranslations();
  const headers = [
    t('admins.table.name'),
    t('admins.table.phone'),
    t('admins.table.email'),
    t('admins.table.role'),
    t('admins.table.status'),
    t('admins.table.action'),
  ];

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  const [role, setRole] = useQueryState('role', parseAsStringEnum<SystemRoles>(Object.values(SystemRoles)));
  const [banned, setBanned] = useQueryState('banned', parseAsString);

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
      label: t('admins.filter.role'),
      options: [
        {
          label: t('admins.filter.all'),
          value: undefined,
        },
        {
          label: t('admins.roles.admin'),
          value: SystemRoles.ADMIN,
        },
        {
          label: t('admins.roles.superAdmin'),
          value: SystemRoles.SUPER_ADMIN,
        },
      ],
      selected: role ?? undefined,
      type: 'radio',
      value: 'role',
    },
    {
      label: t('admins.filter.status'),
      options: [
        {
          label: t('admins.filter.all'),
          value: undefined,
        },
        {
          label: t('admins.filter.active'),
          value: 'false',
        },
        {
          label: t('admins.filter.banned'),
          value: 'true',
        },
      ],
      selected: banned ?? undefined,
      type: 'radio',
      value: 'banned',
    },
  ];

  const { data, isLoading, refetch } = useListAdmins({
    limit: limit.toString(),
    page: page.toString(),
    q: q || undefined,
    role: role || undefined,
    banned: banned || undefined,
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('admins.listTitle')}</h1>
          <NewAdmin />
        </div>
        <p className="text-primary">{t('admins.listDescription')}</p>
      </div>

      <SearchInput
        filter={filterList}
        onChangeAction={(e: any) => setQuery(e.currentTarget.value)}
        onRefreshAction={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('admins.searchPlaceholder')}
        setFilterAction={(newFilter: any) => {
          if ('role' in newFilter) {
            setRole((newFilter.role as SystemRoles) || null);
            setPage(1);
          }
          if ('banned' in newFilter) {
            setBanned(newFilter.banned || null);
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
                {data.data.map((admin: Admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.fullName}</TableCell>
                    <TableCell>{admin.profile?.phoneNumber}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={admin.role} />
                    </TableCell>
                    <TableCell>
                      <Status s={admin.banned ? 'BANNED' : 'ACTIVE'} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admins/${admin.id}`}>{t('admins.table.view')}</Link>
                      </Button>
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
            <EmptyTitle>{t('admins.noAdmins')}</EmptyTitle>
            <EmptyDescription>{t('admins.noAdminsDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
