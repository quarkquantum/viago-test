import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trendLabel,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trendLabel?: string;
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="font-medium text-muted-foreground text-sm">{title}</CardTitle>
      <Icon className="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="font-semibold text-xl">{value}</div>
      {description && <p className="mt-1 text-muted-foreground text-xs">{description}</p>}
      {trendLabel && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-muted-foreground text-xs">{trendLabel}</span>
        </div>
      )}
    </CardContent>
    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-primary/10 to-transparent" />
  </Card>
);
