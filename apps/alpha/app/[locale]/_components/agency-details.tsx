'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/web/src/components/ui/avatar';
import { Badge } from '@repo/design-system/web/src/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import dayjs from 'dayjs';
import {
  Activity,
  BarChart3,
  Building2,
  Bus,
  Calendar,
  Clock,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Pause,
  Play,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StatCard } from '@/components/stat-card';
import { useGetAgency } from '@/features/agencies/api/use-get-agency';
import { useToggleAgencyStatus } from '@/features/agencies/api/use-toggle-agency-status';
import { Link } from '@/i18n/routing';
import { AgencyStatus } from '@repo/shared/constants/agency';

export const AgencyDetails = () => {
  const t = useTranslations('agencies');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const identifier = params.identifier as string;

  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-CM', {
        currency: 'XAF',
        minimumFractionDigits: 0,
        style: 'currency',
      }),
    [locale]
  );

  const formatCurrency = (amount: number) => formatter.format(amount);

  const { data: agency, isLoading, refetch } = useGetAgency(identifier);
  const { mutate: toggleStatus, isPending: isToggling } = useToggleAgencyStatus();

  const handleToggleStatus = async () => {
    const newStatus = agency?.status === AgencyStatus.ACTIVE ? AgencyStatus.SUSPENDED : AgencyStatus.ACTIVE;
    await toggleStatus(
      { identifier, status: newStatus },
      {
        onSuccess: () => {
          refetch();
          setOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5].map((_) => (
            <Skeleton className="h-32" key={`key-${_}`} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((_) => (
            <Skeleton className="h-64" key={`key-${_}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!agency || 'message' in agency) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboard />
            </EmptyMedia>
            <EmptyTitle>{t('details.agencyNotFound')}</EmptyTitle>
            <EmptyDescription>{t('details.agencyNotFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/agencies">{t('details.backToAgencies')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border shadow-sm">
                <AvatarImage src={agency.logo || undefined} />
                <AvatarFallback>
                  <Building2 className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <h1 className="font-bold text-2xl">{agency.name}</h1>
            </div>
            <p className="text-primary">{agency.description || t('details.noDescription')}</p>
          </div>
          <Badge variant={agency.status === AgencyStatus.ACTIVE ? 'default' : 'secondary'}>
            {agency.status === AgencyStatus.ACTIVE ? commonT('status.active') : commonT('status.inactive')}
          </Badge>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                {agency.status === AgencyStatus.ACTIVE ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    {t('details.suspend')}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {t('details.activate')}
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {agency.status === AgencyStatus.ACTIVE
                    ? t('details.suspendTitle')
                    : t('details.activateTitle')}
                </DialogTitle>
                <DialogDescription>
                  {agency.status === AgencyStatus.ACTIVE
                    ? t('details.suspendDescription')
                    : t('details.activateDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {commonT('cancel')}
                </Button>
                <Button
                  variant={agency.status === AgencyStatus.ACTIVE ? 'destructive' : 'default'}
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                >
                  {isToggling ? commonT('loading') : commonT('confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          description={t('details.stats.revenueDescription')}
          icon={DollarSign}
          title={t('details.stats.revenue')}
          value={formatCurrency(agency.stats.revenue)}
        />
        <StatCard
          description={t('details.stats.tripsDescription')}
          icon={MapPin}
          title={t('details.stats.trips')}
          value={agency.stats.trips.toLocaleString()}
        />
        <StatCard
          description={t('details.stats.driversDescription')}
          icon={Users}
          title={t('details.stats.drivers')}
          value={agency.stats.drivers.toLocaleString()}
        />
        <StatCard
          description={t('details.stats.busesDescription')}
          icon={Bus}
          title={t('details.stats.buses')}
          value={agency.stats.buses.toLocaleString()}
        />
        <StatCard
          description={t('details.stats.cashiersDescription')}
          icon={Wallet}
          title={t('details.stats.cashiers')}
          value={agency.stats.cashiers.toLocaleString()}
        />
      </div>

      {/* Information Cards - 2x2 Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                {t('details.businessInfo')}
              </CardTitle>
              <CardDescription>{t('details.businessInfoDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <LayoutDashboard className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('table.slug')}</p>
                <p className="truncate font-medium font-mono">{agency.slug}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <DollarSign className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.notchPayAccount')}</p>
                <p className="truncate font-medium font-mono text-sm">
                  {agency.notchPayAccountId || t('details.notConfigured')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Users className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.ownerId')}</p>
                <p className="font-medium font-mono text-sm">{agency.ownerId || t('details.unassigned')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                {t('details.activityTimeline')}
              </CardTitle>
              <CardDescription>{t('details.activityTimelineDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('table.createdAt')}</p>
                <p className="font-medium">
                  {dayjs(agency.createdAt).locale(locale).format('MMM D, YYYY [at] h:mm A')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Activity className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.lastUpdated')}</p>
                <p className="font-medium">
                  {dayjs(agency.updatedAt).locale(locale).format('MMM D, YYYY [at] h:mm A')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <TrendingUp className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.status')}</p>
                <p className="font-medium capitalize">
                  {agency.status === AgencyStatus.ACTIVE ? commonT('status.active') : commonT('status.inactive')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                {t('details.performanceMetrics')}
              </CardTitle>
              <CardDescription>{t('details.performanceMetricsDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <MapPin className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.bookings')}</p>
                <p className="font-medium">{agency.stats.bookings?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <DollarSign className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.avgRevenuePerTrip')}</p>
                <p className="font-medium">
                  {agency.stats.trips > 0
                    ? formatCurrency(agency.stats.revenue / agency.stats.trips)
                    : formatCurrency(0)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Bus className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.fleetUtilization')}</p>
                <p className="font-medium">
                  {agency.stats.buses > 0
                    ? `${((agency.stats.trips / agency.stats.buses) * 100).toFixed(1)}% ${t('details.active')}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                {t('details.teamOverview')}
              </CardTitle>
              <CardDescription>{t('details.teamOverviewDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Users className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.totalStaff')}</p>
                <p className="font-medium">
                  {(agency.stats.drivers + agency.stats.cashiers).toLocaleString()} {t('details.members')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Bus className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.driverToBusRatio')}</p>
                <p className="font-medium">
                  {agency.stats.buses > 0
                    ? `${(agency.stats.drivers / agency.stats.buses).toFixed(1)} ${t('details.driversPerBus')}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Wallet className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.revenuePerStaff')}</p>
                <p className="font-medium">
                  {agency.stats.drivers + agency.stats.cashiers > 0
                    ? formatCurrency(agency.stats.revenue / (agency.stats.drivers + agency.stats.cashiers))
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
