import { ArrowDown, ArrowRight } from 'lucide-react';
import type { Station } from '@/features/trips/api/use-get-trip';
import { TripStationCard } from './trip-station-card';

// Configuration: Easy to edit
const STATIONS_PER_ROW = 4;

type StationsZigzagLayoutProps = {
  stations: Station[];
};

export const StationsZigzagLayout = ({ stations }: StationsZigzagLayoutProps) => {
  // Chunk stations into rows
  const rows: Station[][] = [];
  for (let i = 0; i < stations.length; i += STATIONS_PER_ROW) {
    rows.push(stations.slice(i, i + STATIONS_PER_ROW));
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((rowStations, rowIndex) => {
        const isRightToLeft = rowIndex % 2 === 1;
        const isLastRow = rowIndex === rows.length - 1;

        return (
          <div className="flex flex-col gap-4" key={`row-${rowIndex}`}>
            {/* Station Row */}
            <div className={`flex items-center gap-4 ${isRightToLeft ? 'flex-row-reverse' : 'flex-row'}`}>
              {rowStations.map((station, stationIndex) => {
                const globalIndex = rowIndex * STATIONS_PER_ROW + stationIndex;
                const isLastInRow = stationIndex === rowStations.length - 1;
                const isLastStation = globalIndex === stations.length - 1;

                return (
                  <div className="flex items-center gap-4" key={station.id}>
                    <TripStationCard index={globalIndex} station={station} totalStations={stations.length} />

                    {/* Arrow between stations */}
                    {!(isLastInRow || isLastStation) && (
                      <ArrowRight
                        className={`size-6 shrink-0 text-muted-foreground ${isRightToLeft ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Arrow down to next row */}
            {!isLastRow && (
              <div className={`flex ${isRightToLeft ? 'justify-start' : 'justify-end'}`}>
                <ArrowDown className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
