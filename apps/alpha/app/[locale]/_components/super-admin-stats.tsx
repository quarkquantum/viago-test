'use client';
import { Card, CardContent, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { Building2, DollarSign, LayoutDashboard, ShieldCheck, TrendingUp, UserSquare2, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { AgencyRevenueChart } from '@/components/agency-revenue-chart';
import { StatCard } from '@/components/stat-card';
import { useGetStats } from '@/features/stats/api/use-get-stats';

export const SuperAdminStats = () => {
  const t = useTranslations('stats');
  const locale = useLocale();
  const { data, isLoading, error } = useGetStats();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-CM', {
      currency: 'XAF',
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(amount);

  const statsData = data?.data;

  const filteredAgencies = useMemo(() => {
    if (!statsData?.agencyRevenues) {
      return [];
    }
    return statsData.agencyRevenues;
  }, [statsData?.agencyRevenues]);

  if (isLoading) {
    return (
      <div className="flex min-h-full w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((_, i) => (
            <Card key={`key-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutDashboard />
          </EmptyMedia>
          <EmptyTitle>{t('errorTitle')}</EmptyTitle>
          <EmptyDescription>{t('errorDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="font-bold text-2xl">{t('title')}</h1>
        <p className="text-primary">{t('description')}</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description={t('counts.totalAdmins')}
          icon={UserSquare2}
          title={t('counts.totalAdmins')}
          value={statsData?.totalAdmins || 0}
        />
        <StatCard
          description={t('counts.totalSuperAdmins')}
          icon={ShieldCheck}
          title={t('counts.totalSuperAdmins')}
          value={statsData?.totalSuperAdmins || 0}
        />
        <StatCard
          description={t('counts.totalAgencies')}
          icon={Building2}
          title={t('counts.totalAgencies')}
          value={statsData?.totalAgencies || 0}
        />
        <StatCard
          description={t('counts.totalDrivers')}
          icon={Users}
          title={t('counts.totalDrivers')}
          value={statsData?.totalDrivers || 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          description={t('revenue.total')}
          icon={DollarSign}
          title={t('revenue.total')}
          value={formatCurrency(statsData?.totalRevenue || 0)}
        />
        <StatCard
          description={t('revenue.today')}
          icon={TrendingUp}
          title={t('revenue.today')}
          value={formatCurrency(statsData?.todayRevenue || 0)}
        />
      </div>

      {/* Agency Revenue Chart */}
      <AgencyRevenueChart
        agencies={filteredAgencies}
        enableSearch={true}
        title={t('revenue.title')}
        viewAllLink="/agencies"
      />
    </div>
  );
};
