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
import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SkeletonTable } from '@/components/skeleton-table';
import { formatCurrency } from '@/helpers/format-currency';
import { useRevenueStats } from '@/features/revenues/api/use-revenue-stats';
import { useTranslations } from 'next-intl';

type Period = 'daily' | 'monthly' | 'yearly';

export const Revenues = () => {
  const t = useTranslations('revenues');
  const tc = useTranslations('common');
  const { data, isLoading } = useRevenueStats();
  const [period, setPeriod] = useState<Period>('daily');

  const rows = data?.data?.[period] ?? [];
  const totals = useMemo(
    () => ({
      revenue: rows.reduce((sum, row) => sum + (row.revenue || 0), 0),
      tickets: rows.reduce((sum, row) => sum + (row.tickets || 0), 0),
    }),
    [rows]
  );

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('title')}</h1>
          <div className="flex gap-2">
            {(['daily', 'monthly', 'yearly'] as const).map((key) => (
              <Button key={key} onClick={() => setPeriod(key)} size="sm" variant={period === key ? 'default' : 'outline'}>
                {t(`periods.${key}`)}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-primary">{t('description')}</p>
      </div>

      {isLoading ? (
        <SkeletonTable header={[t('table.period'), t('table.tickets'), t('table.revenue')]} rows={5} />
      ) : rows.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.period')}</TableHead>
                  <TableHead>{t('table.tickets')}</TableHead>
                  <TableHead>{t('table.revenue')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.tickets}</TableCell>
                    <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40">
                  <TableCell className="font-semibold">{t('table.total')}</TableCell>
                  <TableCell className="font-semibold">{totals.tickets}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(totals.revenue)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BarChart3 />
            </EmptyMedia>
            <EmptyTitle>{t('empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!isLoading && rows.length === 0 && (
        <p className="text-muted-foreground text-xs">{tc('empty.checkBackLater')}</p>
      )}
    </div>
  );
};
