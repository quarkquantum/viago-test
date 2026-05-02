'use client';

import { Card, CardContent, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { Armchair } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGetTripAvailableSeats } from '@/features/trips/api/use-get-trip-available-seats';

type Station = {
  id: string;
  name: string;
};

type Seat = {
  id: string;
  number: number;
  type: string;
};

type SeatMapProps = {
  tripId: string;
  stations: Station[];
  allSeats: Seat[];
  totalSeats: number;
  externalFromStationId?: string;
  externalToStationId?: string;
  onSegmentChange?: (fromStationId: string, toStationId: string) => void;
  onSeatSelect?: (seat: Seat) => void;
  selectedSeatId?: string;
};

export const SeatMap = ({ 
  tripId, 
  stations, 
  allSeats, 
  totalSeats,
  externalFromStationId,
  externalToStationId,
  onSegmentChange,
  onSeatSelect,
  selectedSeatId,
}: SeatMapProps) => {
  const t = useTranslations('trips.details.seatMap');
  const [internalFromStationId, setInternalFromStationId] = useState<string>('');
  const [internalToStationId, setInternalToStationId] = useState<string>('');

  const fromStationId = externalFromStationId ?? internalFromStationId;
  const toStationId = externalToStationId ?? internalToStationId;

  const handleFromStationChange = (value: string) => {
    if (onSegmentChange) {
      onSegmentChange(value, '');
    } else {
      setInternalFromStationId(value);
      setInternalToStationId('');
    }
  };

  const handleToStationChange = (value: string) => {
    if (onSegmentChange) {
      onSegmentChange(fromStationId, value);
    } else {
      setInternalToStationId(value);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (onSeatSelect) {
      onSeatSelect(seat);
    }
  };

  const { data: availableSeatsData, isLoading } = useGetTripAvailableSeats(tripId, {
    fromStationId: fromStationId || undefined,
    toStationId: toStationId || undefined,
  });

  const passengerSeats = allSeats
    .filter((s) => s.type === 'PASSENGER')
    .sort((a, b) => a.number - b.number);

  // Set of available seat IDs for the selected segment
  const availableIds = new Set<string>((availableSeatsData?.data ?? []).map((s: { id: string }) => s.id));

  const segmentSelected = Boolean(fromStationId && toStationId);
  const availableCount = segmentSelected ? availableIds.size : null;
  const occupiedCount = segmentSelected ? passengerSeats.length - availableIds.size : null;

  // Group into rows of 4: [left1, left2 | aisle | right1, right2]
  const rows: Seat[][] = [];
  for (let i = 0; i < passengerSeats.length; i += 4) {
    rows.push(passengerSeats.slice(i, i + 4));
  }

  const toOptions = stations.filter((s) => s.id !== fromStationId);
  const fromOptions = stations.filter((s) => s.id !== toStationId);

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Armchair className="size-5 text-primary" />
            <span className="font-semibold text-lg">{t('title')}</span>
          </div>
          {segmentSelected && !isLoading && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-emerald-500" />
                {t('available')} ({availableCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-3 rounded-sm bg-destructive/70" />
                {t('occupied')} ({occupiedCount})
              </span>
              <span className="text-muted-foreground">
                {t('total')}: {totalSeats}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Segment selector - only show when not controlled externally */}
        {!externalFromStationId && !externalToStationId && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Select
              onValueChange={handleFromStationChange}
              value={fromStationId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('selectFrom')} />
              </SelectTrigger>
              <SelectContent>
                {fromOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground text-sm">→</span>

            <Select
              disabled={!fromStationId}
              onValueChange={handleToStationChange}
              value={toStationId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('selectTo')} />
              </SelectTrigger>
              <SelectContent>
                {toOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!segmentSelected ? (
          <p className="text-center text-muted-foreground text-sm">{t('selectSegmentHint')}</p>
        ) : isLoading ? (
          <div className="mx-auto w-fit rounded-2xl border-2 border-border bg-muted/20 p-4">
            <div className="mb-4 flex justify-center">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.ceil(passengerSeats.length / 4) }).map((_, i) => (
                <div className="flex items-center gap-3" key={i}>
                  <div className="flex gap-1.5">
                    <Skeleton className="size-10 rounded-md" />
                    <Skeleton className="size-10 rounded-md" />
                  </div>
                  <div className="w-4" />
                  <div className="flex gap-1.5">
                    <Skeleton className="size-10 rounded-md" />
                    <Skeleton className="size-10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Bus shell */
          <div className="mx-auto w-fit rounded-2xl border-2 border-border bg-muted/20 p-4">
            {/* Windshield */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-t-xl border border-border bg-muted/40 px-8 py-1 text-muted-foreground text-xs">
                {t('driver')}
              </div>
            </div>

            {/* Seat rows */}
            <div className="flex flex-col gap-2">
              {rows.map((row, rowIndex) => {
                const left = row.slice(0, 2);
                const right = row.slice(2, 4);

                return (
                  <div className="flex items-center gap-3" key={rowIndex}>
                    {/* Left pair */}
                    <div className="flex gap-1.5">
                      {left.map((seat) => (
                        <SeatCell
                          key={seat.id}
                          isOccupied={!availableIds.has(seat.id)}
                          number={seat.number}
                          isSelected={selectedSeatId === seat.id}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ))}
                      {left.length < 2 && <div className="size-10" />}
                    </div>

                    {/* Aisle / row number */}
                    <div className="w-4 text-center text-muted-foreground text-xs">{rowIndex + 1}</div>

                    {/* Right pair */}
                    <div className="flex gap-1.5">
                      {right.map((seat) => (
                        <SeatCell
                          key={seat.id}
                          isOccupied={!availableIds.has(seat.id)}
                          number={seat.number}
                          isSelected={selectedSeatId === seat.id}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ))}
                      {right.length < 2 && <div className="size-10" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type SeatCellProps = {
  number: number;
  isOccupied: boolean;
  isSelected?: boolean;
  onClick?: () => void;
};

const SeatCell = ({ number, isOccupied, isSelected, onClick }: SeatCellProps) => (
  <button
    type="button"
    disabled={isOccupied}
    onClick={onClick}
    className={`flex size-10 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
      isOccupied
        ? 'cursor-not-allowed border-destructive/40 bg-destructive/15 text-destructive'
        : isSelected
        ? 'cursor-pointer border-primary bg-primary text-primary-foreground'
        : 'cursor-pointer border-emerald-400/50 bg-emerald-50 text-emerald-700 hover:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400'
    }`}
  >
    {number}
  </button>
);
