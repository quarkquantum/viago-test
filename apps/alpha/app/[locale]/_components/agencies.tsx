'use client';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AgenciesTable } from '@/components/agencies/agencies-table';
import { TicketsByStatusChart } from '@/components/tickets-by-status-chart';
import { useGetStats } from '@/features/stats/api/use-get-stats';

export const Agencies = () => {
  const t = useTranslations('agencies');
  const { data, isLoading, error } = useGetStats({ limit: '100' });

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t('errorTitle')}</EmptyTitle>
            <EmptyDescription>{t('errorDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('title')}</h1>
        </div>
        <p className="text-primary">{t('description')}</p>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-[2px]">
            <p className="font-medium text-muted-foreground">{t('refreshingData')}</p>
          </div>
        )}
        <TicketsByStatusChart ticketsByStatus={data?.data?.ticketsByStatus ?? {
          issued: 0,
          consumed: 0,
          cancelled: 0,
          refunded: 0,
          expired: 0,
          reserved: 0,
        }} />
      </div>

      <AgenciesTable />
    </div>
  );
};
