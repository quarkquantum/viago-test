import dayjs from 'dayjs';
import { Bus } from 'lucide-react';
import type { Trip } from '@/features/trips/api/use-get-trip';

type stationItemProps = {
  station: Trip['stations'][number];
};
export const StationItem = ({ station }: stationItemProps) => (
  <div className="flex w-full items-center">
    <div className="flex w-full items-center gap-2">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/90 text-white">
          <Bus />
        </div>
      </div>
      <h1>{station.name}</h1>
    </div>
    <div className="flex w-full flex-col text-right">
      <h1>{dayjs(station.departureTime).format('ddd, D MMM YYYY HH:mm')}</h1>
    </div>
  </div>
);
