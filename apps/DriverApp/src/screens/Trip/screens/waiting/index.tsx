import type BottomSheet from '@gorhom/bottom-sheet';
import { StationStatus } from '@repo/shared';
import { AlertTriangle } from 'lucide-react-native';
import { useRef } from 'react';
import { View } from 'react-native';
import { Portal } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { ReportSheet } from '@/features/trips/components/report-sheet';
import { StationTimeline } from '@/features/trips/components/station-timeline';
import { TripHeader } from '@/features/trips/components/trip-header';
import { useTripState } from '@/features/trips/hooks/use-trip-state';
import { BaseView } from '../../components/base-view';
import { ExpandableWaitingCard } from './components/expandable-waiting-card';

export const WaitingScreen = ({ trip }: { trip: Trip }) => {
  const { handleUpdateStation } = useTripState(trip);
  const reportSheetRef = useRef<BottomSheet>(null);

  return (
    <>
      <BaseView
        scrollable
        actions={[{ type: 'icon', icon: AlertTriangle, onPress: () => reportSheetRef.current?.expand() }]}
      >
        <TripHeader trip={trip} />
        <View style={{ flex: 1, position: 'relative' }}>
          <StationTimeline
            onCompleteStation={(id) => {
              handleUpdateStation(id, StationStatus.COMPLETED);
            }}
            onScanTickets={() => {
              // No-op
            }}
            onStartStation={(id) => {
              const station = trip.stations.find((s) => s.id === id);
              if (!station) {
                return;
              }

              if (station.status === StationStatus.PENDING) {
                // "Start Boarding" clicked
                handleUpdateStation(id, StationStatus.BOARDING);
              } else if (station.status === StationStatus.BOARDING) {
                // "Start Trip" clicked
                handleUpdateStation(id, StationStatus.ACTIVE);
              }
            }}
            stations={trip.stations}
            tripId={trip.id}
          />
        </View>
      </BaseView>
      <ExpandableWaitingCard trip={trip} />
      <Portal>
        <ReportSheet ref={reportSheetRef} tripId={trip.id} />
      </Portal>
    </>
  );
};
