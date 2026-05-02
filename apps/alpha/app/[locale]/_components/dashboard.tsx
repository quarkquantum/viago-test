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
import { Building2, DollarSign, LayoutDashboard, Ticket, TrendingUp, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StatCard } from '@/components/stat-card';
import { TicketsByStatusChart } from '@/components/tickets-by-status-chart';
import { useGetStats } from '@/features/stats/api/use-get-stats';

export const Dashboard = () => {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { data, isLoading, error } = useGetStats({ limit: '5' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-CM', {
      currency: 'XAF',
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(amount);

  const ticketsByStatus = useMemo(() => {
    return data?.data?.ticketsByStatus || {
      issued: 0,
      consumed: 0,
      cancelled: 0,
      refunded: 0,
      expired: 0,
      reserved: 0,
    };
  }, [data?.data?.ticketsByStatus]);

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('title')}</h1>
        </div>
        <p className="text-primary">{t('description')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {['stat-1', 'stat-2', 'stat-3'].map((id) => (
              <Card key={id}>
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
        </div>
      ) : error ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboard />
            </EmptyMedia>
            <EmptyTitle>{t('errorTitle')}</EmptyTitle>
            <EmptyDescription>{t('errorDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              description={t('stats.totalRevenueDescription')}
              icon={DollarSign}
              title={t('stats.totalRevenue')}
              value={formatCurrency(data?.data?.totalRevenue || 0)}
            />
            <StatCard
              description={t('stats.todayRevenueDescription')}
              icon={TrendingUp}
              title={t('stats.todayRevenue')}
              value={formatCurrency(data?.data?.todayRevenue || 0)}
            />
            <StatCard
              description={t('stats.totalDriversDescription')}
              icon={Users}
              title={t('stats.totalDrivers')}
              value={data?.data?.totalDrivers?.toLocaleString() || '0'}
            />
            <StatCard
              description={t('stats.totalAgenciesDescription')}
              icon={Building2}
              title={t('stats.totalAgencies')}
              value={data?.data?.totalAgencies?.toLocaleString() || '0'}
            />
            <StatCard
              description={t('stats.totalTicketsDescription')}
              icon={Ticket}
              title={t('stats.totalTickets')}
              value={data?.data?.totalTickets?.toLocaleString() || '0'}
            />
            <StatCard
              description={t('stats.totalPassengersDescription')}
              icon={Users}
              title={t('stats.totalPassengers')}
              value={data?.data?.totalPassengers?.toLocaleString() || '0'}
            />
          </div>

          {/* Tickets by Status Chart */}
          <TicketsByStatusChart ticketsByStatus={ticketsByStatus} />
        </div>
      )}
    </div>
  );
};
