'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { Check, Pin, Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from '@/i18n/routing';

const formatCurrency = (amount: number, locale = 'en-US') =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-CM' : locale, {
    currency: 'XAF',
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);

type AgencyRevenue = {
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  revenue: number;
};

type AgencyRevenueChartProps = {
  agencies: AgencyRevenue[];
  title?: string;
  viewAllLink?: string;
  enableSearch?: boolean;
  onSearchChangeAction?: (query: string) => void;
};

const AgencyListItem = ({
  agency,
  isPinned,
  isSelected,
  percentOfTotal,
  onClick,
  locale,
}: {
  agency: AgencyRevenue;
  isPinned: boolean;
  isSelected: boolean;
  percentOfTotal: string;
  onClick: () => void;
  locale: string;
}) => (
  <button
    className={cn(
      'group flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left transition-all hover:shadow-md',
      isSelected ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'bg-card hover:bg-muted/50',
      isPinned && 'ring-1 ring-primary/30'
    )}
    onClick={onClick}
    type="button"
  >
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded transition-colors',
          isSelected ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/40'
        )}
      >
        {isSelected && <Check className="h-3.5 w-3.5" />}
      </div>
      <div className="flex flex-col items-start">
        {agency.agencyName}
        <span className="text-muted-foreground text-xs">{agency.agencySlug}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {isPinned && <Pin className="h-3.5 w-3.5 text-primary" />}
      <div className="text-right">
        <span className="block font-semibold text-sm">{formatCurrency(agency.revenue, locale)}</span>
        <span className="text-muted-foreground text-xs">{percentOfTotal}%</span>
      </div>
    </div>
  </button>
);

export const AgencyRevenueChart = ({
  agencies,
  title,
  viewAllLink,
  enableSearch = true,
  onSearchChangeAction,
}: AgencyRevenueChartProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgencies, setSelectedAgencies] = useState<AgencyRevenue[]>([]);

  const selectedIds = useMemo(() => selectedAgencies.map((a) => a.agencyId), [selectedAgencies]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChangeAction?.(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearchChangeAction?.('');
  };

  // Filter agencies for the list based on search - pinned agencies always show at top
  const listAgencies = useMemo(() => {
    // Get pinned agencies first (always visible)
    const pinned = selectedAgencies.sort((a, b) => b.revenue - a.revenue);

    // Get non-pinned agencies
    let unpinned = agencies.filter((a) => !selectedIds.includes(a.agencyId));

    // Apply search filter to unpinned agencies only
    if (searchQuery) {
      unpinned = unpinned.filter((a) => a.agencyName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort unpinned by revenue
    unpinned = unpinned.sort((a, b) => b.revenue - a.revenue);

    return { pinned, unpinned };
  }, [agencies, searchQuery, selectedIds, selectedAgencies]);

  // Determine which agencies to show in the chart
  const chartData = useMemo(() => {
    if (selectedAgencies.length > 0) {
      // Show selected agencies
      return selectedAgencies
        .sort((a, b) => b.revenue - a.revenue)
        .map((agency) => ({
          name: agency.agencyName,
          revenue: agency.revenue,
        }));
    }
    // Default: Show top 5 from agencies
    return agencies
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((agency) => ({
        name: agency.agencyName,
        revenue: agency.revenue,
      }));
  }, [agencies, selectedAgencies]);

  const totalRevenue = useMemo(() => agencies.reduce((sum, agency) => sum + agency.revenue, 0), [agencies]);
  const selectedRevenue = useMemo(
    () => selectedAgencies.reduce((sum, agency) => sum + agency.revenue, 0),
    [selectedAgencies]
  );

  const toggleSelection = (agency: AgencyRevenue) => {
    setSelectedAgencies((prev) =>
      prev.some((a) => a.agencyId === agency.agencyId)
        ? prev.filter((a) => a.agencyId !== agency.agencyId)
        : [...prev, agency]
    );
  };

  const clearAllSelected = () => {
    setSelectedAgencies([]);
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-col gap-4 space-y-0 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-4 font-semibold text-xl tracking-tight">
            {title || t('agencies.revenueByAgency')}
          </CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              {t('agencies.total')}:{' '}
              <span className="font-medium text-foreground">{formatCurrency(totalRevenue, locale)}</span>
            </span>
            {selectedAgencies.length > 0 && (
              <span className="text-muted-foreground">
                {t('agencies.selected')} ({selectedAgencies.length}):{' '}
                <span className="font-medium text-primary">{formatCurrency(selectedRevenue, locale)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {enableSearch && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-8 pl-9"
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('agencies.searchPlaceholder')}
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {viewAllLink && (
            <Button asChild size="sm" variant="link">
              <Link href={viewAllLink}>{t('agencies.viewAll')}</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {agencies.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            {t('agencies.noRevenueData')}
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Chart Section */}
            <div className="h-80 w-full lg:h-96 lg:w-2/3">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    angle={-45}
                    axisLine={false}
                    dataKey="name"
                    interval={0}
                    textAnchor="end"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background px-4 py-3 shadow-xl">
                            <p className="font-medium text-sm">{payload[0].payload.name}</p>
                            <p className="font-bold text-lg text-primary">
                              {formatCurrency(payload[0].value as number, locale)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar
                    barSize={40}
                    className="fill-primary"
                    dataKey="revenue"
                    fill="currentColor"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List Section */}
            <div className="w-full lg:w-1/3">
              {/* Selected agencies indicator */}
              {selectedAgencies.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {t('agencies.pinned')} ({selectedAgencies.length})
                  </span>
                  <button
                    className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
                    onClick={clearAllSelected}
                    type="button"
                  >
                    {t('agencies.clearAll')}
                  </button>
                </div>
              )}

              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1 lg:max-h-96">
                {/* Pinned agencies always at top */}
                {listAgencies.pinned.map((agency) => (
                  <AgencyListItem
                    agency={agency}
                    isPinned
                    isSelected={selectedIds.includes(agency.agencyId)}
                    key={agency.agencyId}
                    locale={locale}
                    onClick={() => toggleSelection(agency)}
                    percentOfTotal={totalRevenue > 0 ? ((agency.revenue / totalRevenue) * 100).toFixed(1) : '0'}
                  />
                ))}

                {/* Separator if both pinned and unpinned exist */}
                {listAgencies.pinned.length > 0 && listAgencies.unpinned.length > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-muted-foreground text-xs">{t('agencies.otherAgencies')}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                {/* Unpinned agencies */}
                {listAgencies.unpinned.map((agency) => (
                  <AgencyListItem
                    agency={agency}
                    isPinned={false}
                    isSelected={selectedIds.includes(agency.agencyId)}
                    key={agency.agencyId}
                    locale={locale}
                    onClick={() => toggleSelection(agency)}
                    percentOfTotal={totalRevenue > 0 ? ((agency.revenue / totalRevenue) * 100).toFixed(1) : '0'}
                  />
                ))}

                {/* Empty search result */}
                {listAgencies.unpinned.length === 0 && searchQuery && (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {t('agencies.noAgenciesFound', { query: searchQuery })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
