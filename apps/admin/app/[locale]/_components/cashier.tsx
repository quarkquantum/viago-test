'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { Building2, Calendar, CheckCircle2, Mail, Phone, TextSelection, User2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { DeleteCashierDialog } from '@/components/cashier/delete-cashier-dialog';
import { UpdateCashier } from '@/components/cashier/update-cashier';
import { Status } from '@/components/status';
import { CashierTickets } from '@/components/user/user-cashier-tickets';
import { useGetCashier } from '@/features/cashiers/api/use-get-cashier';
import { useSendResetPasswordEmail } from '@/features/users/api/use-send-reset-password-email';

export const Cashier = () => {
  const t = useTranslations('cashiers');
  const tc = useTranslations('common');
  const params = useParams();
  const userId = params.cashier as string;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');

  const scrollY = useRef(0);

  useDebounce(
    () => {
      scrollY.current = window.scrollY;
      setPage(1);
      setQ(query);
    },
    300,
    [query]
  );

  const queryParams = () => ({
    limit: limit.toString(),
    page: page.toString(),
    q,
  });

  const { data: userData, isLoading, refetch } = useGetCashier(userId, queryParams());
  const sendResetEmail = useSendResetPasswordEmail(userId);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, scrollY.current);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!userData || 'message' in userData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User2 />
            </EmptyMedia>
            <EmptyTitle>{t('list.notFound')}</EmptyTitle>
            <EmptyDescription>{t('list.notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/users">{t('list.backToUsers')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { cashier: data, pagination } = userData;
  const { user, agency, ...cashier } = data;
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <div className="flex gap-2">
            <Button disabled={sendResetEmail.isPending} onClick={() => sendResetEmail.mutate()} variant="outline">
              <Mail className="mr-2 size-4" />
              {sendResetEmail.isPending ? tc('updating') : t('resetPassword.trigger')}
            </Button>
            <UpdateCashier id={cashier.id} />
            <DeleteCashierDialog cashierId={cashier.id} />
          </div>
        </div>
        <p className="text-primary">{t('details.description')}</p>
      </div>

      {/* Passenger Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User2 className="size-5 text-primary" />
                {tc('table.personalInfo')}
              </CardTitle>
              <CardDescription>{tc('table.personalInfoDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.fullName')}</p>
                <p className="truncate font-medium">{user.fullName || user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.emailAddress')}</p>
                <p className="truncate font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.status')}</p>
                <p className="font-medium">{user.emailVerified ? tc('table.verified') : tc('table.notVerified')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.phoneNumber')}</p>
                <p className="font-medium">{user.profile?.phoneNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                {tc('table.accountDetails')}
              </CardTitle>
              <CardDescription>{tc('table.accountDetailsDescription')}</CardDescription>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Building2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyName')}</p>
                <p className="truncate font-medium">{agency.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <TextSelection className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyDescription')}</p>
                <p className="truncate font-medium">{agency.description}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyStatus')}</p>
                <Status s={agency.status} />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{tc('table.memberSince')}</p>
                <p className="font-medium">{dayjs(user.createdAt).format('MMM D, YYYY')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <CashierTickets
        onLimitChange={(newLimit: number) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onPageChange={setPage}
        onQueryChange={setQuery}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        pagination={pagination}
        query={query}
        tickets={user.tickets}
      />
    </div>
  );
};
