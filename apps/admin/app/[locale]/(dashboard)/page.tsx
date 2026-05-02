'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/web/src/components/ui/card';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { Building2, FileText, Pause, Play, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Greeting } from '@/components/greeting';
import { useGetDashboard } from '@/features/dashboard/api/use-get-dashboard';

const Page = () => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { data, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`key-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { stats } = data?.data || { stats: { agencies: { total: 0, active: 0, pending: 0, suspended: 0 } } };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Greeting />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAgencies')}</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agencies.total}</div>
            <p className="text-xs text-muted-foreground">{t('stats.registeredAgencies')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pendingRequests')}</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agencies.pending}</div>
            <p className="text-xs text-muted-foreground">{t('stats.awaitingReview')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.suspendedAgencies')}</CardTitle>
            <Pause className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agencies.suspended}</div>
            <p className="text-xs text-muted-foreground">{t('stats.needAttention')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>{t('sections.quickActions')}</CardTitle>
              <CardDescription>{t('sections.quickActionsDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full justify-start">
              <Link href="/agency-requests">
                <FileText className="mr-2 size-4" />
                {t('actions.reviewRequests')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/agencies">
                <Building2 className="mr-2 size-4" />
                {t('actions.manageAgencies')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>{t('sections.systemStatus')}</CardTitle>
              <CardDescription>{t('sections.systemStatusDesc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span className="text-sm">{t('stats.activeUsers')}</span>
                </div>
                <span className="text-sm font-medium">{stats.agencies.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="size-4 text-green-500" />
                  <span className="text-sm">{t('stats.systemOperational')}</span>
                </div>
                <span className="text-sm font-medium text-green-500">{tCommon('status.active')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
