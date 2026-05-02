import { Badge } from '@repo/design-system/web/src/components/ui/badge';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { useTranslations } from 'next-intl';

const statusClasses: Record<string, string> = {
  ACTIVE: 'px-3 bg-primary/20 text-primary',
  ONGOING: 'px-3 bg-primary/20 text-primary',
  BANNED: 'px-3 bg-destructive/20 text-destructive/80',
  BREAKDOWN: 'px-3 bg-red-100 text-red-800',
  CANCELLED: 'px-3 bg-destructive/20 text-destructive/80',
  COMPLETED: 'px-3 bg-purple-100 text-purple-800',
  CONFIRMED: 'px-3 bg-primary/20 text-primary',
  DEFAULT: 'px-3 bg-muted text-muted-foreground',
  DELETED: 'px-3 bg-destructive/20 text-destructive/80',
  ISSUED: 'px-3 bg-primary/20 text-primary',
  MAINTENANCE: 'px-3 bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'px-3 bg-orange-100 text-orange-800',
  PENDING: 'px-3 bg-yellow-100 text-yellow-800',
  REFUNDED: 'px-3 bg-destructive/20 text-destructive/80',
  TO_REPLACE: 'px-3 bg-amber-100 text-amber-800',
  DEPARTURE: 'px-3 bg-blue-100/50 text-blue-700 border-blue-200',
  ARRIVAL: 'px-3 bg-emerald-100/50 text-emerald-700 border-emerald-200',
};

const getTranslationKey = (status: string): string => {
  const map: Record<string, string> = {
    ONGOING: 'ongoing',
    ACTIVE: 'active',
    BANNED: 'banned',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    CONFIRMED: 'confirmed',
    DEFAULT: 'default',
    DELETED: 'deleted',
    EXPIRED: 'expired',
    INACTIVE: 'inactive',
    ISSUED: 'issued',
    MAINTENANCE: 'maintenance',
    NOT_VERIFIED: 'notVerified',
    OUT_OF_SERVICE: 'outOfService',
    BREAKDOWN: 'breakdown',
    TO_REPLACE: 'toReplace',
    NUMBERED: 'numbered',
    OCCUPIED: 'occupied',
    PENDING: 'pending',
    REFUNDED: 'refunded',
    SUSPENDED: 'suspended',
    UNNUMBERED: 'unnumbered',
    VERIFIED: 'verified',
    DEPARTURE: 'departure',
    ARRIVAL: 'arrival',
  };

  return map[status] || 'default';
};

type StatusProps = {
  s?: string;
  status?: string;
  className?: string;
};

export const Status = ({ s, status, className }: StatusProps) => {
  const t = useTranslations('common.status');
  const finalStatus = (status || s || 'DEFAULT').toUpperCase();
  const translationKey = getTranslationKey(finalStatus);

  return (
    <Badge className={cn(statusClasses[finalStatus] ?? statusClasses.DEFAULT, className)} title={t(translationKey)}>
      {t(translationKey)}
    </Badge>
  );
};
