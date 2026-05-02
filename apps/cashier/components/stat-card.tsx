import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { cn } from '@repo/design-system/web/src/lib/utils';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value?: string | number;
  description?: string;
  trendLabel?: string;
  isLoading?: boolean;
  className?: string;
};

export const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  trendLabel,
  isLoading,
  className,
}: StatCardProps) => (
  <Card className={cn('relative overflow-hidden', className)}>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="font-medium text-muted-foreground text-sm">{title}</CardTitle>
      <Icon className="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="font-semibold text-xl">{value}</div>}
      {description && <p className="mt-1 text-muted-foreground text-xs">{description}</p>}
      {trendLabel && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-muted-foreground text-xs">{trendLabel}</span>
        </div>
      )}
    </CardContent>
    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-linear-to-br from-primary/10 to-transparent" />
  </Card>
);
