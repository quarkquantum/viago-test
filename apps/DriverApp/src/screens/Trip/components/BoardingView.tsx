import { Colors } from '@repo/shared';
import { StationStatus } from '@repo/shared/constants';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Station, Trip } from '@/features/trips/api/use-get-trip';
import { StationTimeline } from '@/features/trips/components/station-timeline';
import { TripStatusView } from '@/features/trips/components/trip-status-view';

type Props = {
  trip: Trip;
  stations: Station[];
  message: string;
  canStartTrip: boolean;
  tripStatusLoading: boolean;
  onScanTickets: () => void;
  onStartTrip: () => void;
  onUpdateStation: (id: string, status: StationStatus) => void;
};

export const BoardingView = ({
  trip,
  stations,
  message,
  canStartTrip,
  tripStatusLoading,
  onScanTickets,
  onStartTrip,
  onUpdateStation,
}: Props) => {
  const { t } = useTranslation();

  return (
    <View style={styles.boardingContainer}>
      <Text style={styles.messageText}>{t(message)}</Text>
      {canStartTrip && (
        <TripStatusView
          loading={tripStatusLoading}
          onScanTickets={onScanTickets}
          onStartTrip={onStartTrip}
          trip={trip}
        />
      )}

      <StationTimeline
        onCompleteStation={() => {
          /* usually disabled in boarding */
        }}
        onScanTickets={onScanTickets}
        onStartStation={(id) => {
          const station = stations.find((s) => s.id === id);
          // In boarding screen, only mark as boarding is allowed usually for first station
          if (station?.actions?.canMarkAsBoarding) {
            onUpdateStation(id, StationStatus.BOARDING);
          }
        }}
        stations={stations}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  boardingContainer: {
    paddingVertical: 16,
  },
  messageText: {
    textAlign: 'center',
    color: Colors.ACCENT,
    marginBottom: 16,
  },
});
