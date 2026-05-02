import dayjs from 'dayjs';
import { MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatCurrency } from '@/helpers/format-currency';

type stationItemProps = {
  departure?: boolean;
  station: {
    name: string;
    startingPrice: number;
    departureTime: string | Date;
  };
  arrival?: boolean;
};
export const StationItem = ({ station, departure, arrival }: stationItemProps) => {
  const t = useTranslations('common');
  const locale = useLocale();
  return (
    <div className="flex w-full items-center">
      <div className="flex w-full items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
            <MapPin className="size-5" />
          </div>
        </div>
        <div className="flex flex-col text-left">
          {departure && <p className="text-muted-foreground text-xs">{t('departure')}</p>}
          {arrival && <p className="text-muted-foreground text-xs">{t('arrival')}</p>}
          <h1 className="font-semibold text-sm">{station.name}</h1>
          <p className="text-muted-foreground text-xs">{formatCurrency(station.startingPrice, locale)}</p>
        </div>
      </div>
      <div className="flex w-full flex-col text-right text-sm">
        <h1>{dayjs(station.departureTime).locale(locale).format('ddd, D MMM YYYY HH:mm')}</h1>
      </div>
    </div>
  );
};
