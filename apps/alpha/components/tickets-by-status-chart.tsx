'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { TicketCheck, TicketX, Clock, Ban, RefreshCcw, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type TicketsByStatus = {
  issued: number;
  consumed: number;
  cancelled: number;
  refunded: number;
  expired: number;
  reserved: number;
};

type TicketsByStatusChartProps = {
  ticketsByStatus: TicketsByStatus;
};

const statusConfig = {
  issued: { color: '#22c55e', label: 'Issued' },
  consumed: { color: '#3b82f6', label: 'Consumed' },
  cancelled: { color: '#ef4444', label: 'Cancelled' },
  refunded: { color: '#f59e0b', label: 'Refunded' },
  expired: { color: '#6b7280', label: 'Expired' },
  reserved: { color: '#8b5cf6', label: 'Reserved' },
};

const statusIcons = {
  issued: TicketCheck,
  consumed: TicketCheck,
  cancelled: TicketX,
  refunded: RefreshCcw,
  expired: Clock,
  reserved: Ticket,
};

export const TicketsByStatusChart = ({ ticketsByStatus }: TicketsByStatusChartProps) => {
  const t = useTranslations('dashboard');

  const data = Object.entries(ticketsByStatus).map(([key, value]) => ({
    name: t(`ticketStatus.${key}`),
    value,
    fill: statusConfig[key as keyof typeof statusConfig]?.color || '#6b7280',
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t('ticketStatusChart')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-md border bg-background p-2 shadow-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <cell fill={entry.fill} key={`cell-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data.map((item) => {
            const Icon = statusIcons[item.name.toLowerCase() as keyof typeof statusIcons] || Ticket;
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${item.fill}20` }}>
                  <Icon className="h-4 w-4" style={{ color: item.fill }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                  <p className="font-medium">{item.value.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
