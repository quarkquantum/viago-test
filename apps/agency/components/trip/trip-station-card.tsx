'use client';

import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import type { Station } from '@/features/trips/api/use-get-trip';
import { formatCurrency } from '@/helpers/format-currency';

type TripStationCardProps = {
  station: Station;
  index: number;
  totalStations: number;
};

export const TripStationCard = ({ station, index, totalStations }: TripStationCardProps) => (
  <div className="flex w-full min-w-55 flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow-md">
    <div className="flex items-center justify-between">
      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
        {index + 1}
      </span>
      {index === 0 && (
        <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs">Start</span>
      )}
      {index === totalStations - 1 && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs">End</span>
      )}
    </div>

    <div className="flex flex-col gap-1">
      <span className="truncate font-semibold text-base" title={station.name}>
        {station.name}
      </span>
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Clock className="size-3" />
        {dayjs(station.departureTime).format('D MMM, HH:mm')}
      </span>
    </div>

    <div className="mt-1 flex items-center justify-between border-t pt-2">
      <span className="font-medium text-muted-foreground text-xs uppercase">Price</span>
      <span className="font-bold text-primary text-sm">{formatCurrency(station.startingPrice)}</span>
    </div>
  </div>
);
