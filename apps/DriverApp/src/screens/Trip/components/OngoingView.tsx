import { Colors } from '@repo/shared';
import { StationStatus } from '@repo/shared/constants';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { Station } from '@/features/trips/api/use-get-trip';
import { StationTimeline } from '@/features/trips/components/station-timeline';

type Props = {
  stations: Station[];
  canCompleteTrip: boolean;
  onScanTickets: () => void;
  onUpdateStation: (id: string, status: StationStatus) => void;
  onCompleteTrip: () => void;
};

export const OngoingView = ({ stations, canCompleteTrip, onScanTickets, onUpdateStation, onCompleteTrip }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <StationTimeline
        onCompleteStation={(id) => onUpdateStation(id, StationStatus.COMPLETED)}
        onScanTickets={onScanTickets}
        onStartStation={(id) => {
          const station = stations.find((s) => s.id === id);
          if (station?.actions?.canMarkAsBoarding) {
            onUpdateStation(id, StationStatus.BOARDING);
          } else if (station?.actions?.canMarkAsActive) {
            onUpdateStation(id, StationStatus.ACTIVE);
          }
        }}
        stations={stations}
      />
      {canCompleteTrip && (
        <Button mode="contained" onPress={onCompleteTrip} style={styles.completeButton}>
          {t('trips.actions.completeTrip')}
        </Button>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  completeButton: {
    margin: 16,
    backgroundColor: Colors.SUCCESS,
  },
});
