import type BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StationStatus } from '@repo/shared';
import { AlertTriangle } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { ReportSheet } from '@/features/trips/components/report-sheet';
import { StationTimeline } from '@/features/trips/components/station-timeline';
import { TripHeader } from '@/features/trips/components/trip-header';
import { useTripState } from '@/features/trips/hooks/use-trip-state';
import type { RootNav } from '@/navigation/RootNavigator';
import { BaseView } from '../../components/base-view';
import { ExpandableSheet } from '../../components/ExpandableSheet';
import { OngoingCardContent } from '../../components/expandable-contents/OngoingCardContent';

export const OngoingScreen = ({ trip }: { trip: Trip }) => {
  const navigation = useNavigation<RootNav>();
  const { handleUpdateStation } = useTripState(trip);
  const reportSheetRef = useRef<BottomSheet>(null);

  const handleCompleteStation = (stationId: string) => {
    handleUpdateStation(stationId, StationStatus.COMPLETED);
  };

  const handleStartTrip = (stationId: string) => {
    handleUpdateStation(stationId, StationStatus.ACTIVE);
  };

  const handleScanTickets = () => {
    navigation.navigate('Scan', { tripId: trip.id });
  };

  return (
    <>
      <BaseView
        actions={[{ type: 'icon', icon: AlertTriangle, onPress: () => reportSheetRef.current?.expand() }]}
        scrollable
      >
        <TripHeader trip={trip} />
        <View style={styles.stationContainer}>
          <StationTimeline
            onCompleteStation={handleCompleteStation}
            onScanTickets={handleScanTickets}
            onStartStation={(id) => {
              const station = trip.stations.find((s) => s.id === id);
              if (!station) {
                return;
              }

              if (station.status === StationStatus.PENDING) {
                handleUpdateStation(id, StationStatus.BOARDING);
              } else if (station.status === StationStatus.BOARDING) {
                handleUpdateStation(id, StationStatus.ACTIVE);
              }
            }}
            stations={trip.stations}
            tripId={trip.id}
          />
        </View>
      </BaseView>
      <ExpandableSheet
        content={OngoingCardContent}
        contentProps={{
          trip,
          onCompleteStation: handleCompleteStation,
          onStartTrip: handleStartTrip,
          onScanTickets: handleScanTickets,
        }}
      />
      <Portal>
        <ReportSheet ref={reportSheetRef} tripId={trip.id} />
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  stationContainer: {
    flex: 1,
    position: 'relative',
  },
});
