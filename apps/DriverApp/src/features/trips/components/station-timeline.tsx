import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Station } from '../api/use-get-trip';
import { StationRow } from './station-row';

type StationTimelineProps = {
  stations: Station[];
  onStartStation: (id: string) => void;
  onCompleteStation: (id: string) => void;
  onScanTickets: (id: string) => void;
  tripId: string;
};

export const StationTimeline = ({
  stations,
  onStartStation,
  onCompleteStation,
  onScanTickets,
  tripId,
}: StationTimelineProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trips.details.stations')}</Text>
      <View style={styles.card}>
        {stations.map((station, index) => (
          <StationRow
            isLast={index === stations.length - 1}
            key={station.id}
            onCompleteStation={() => onCompleteStation(station.id)}
            onScanTickets={() => onScanTickets(station.id)}
            onStartStation={() => onStartStation(station.id)}
            station={station}
            tripId={tripId}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.ACCENT,
    marginBottom: 12,
  },
  card: {
    // padding: 16,
    // borderRadius: 16,
    // backgroundColor: Colors.BACKGROUND,
    // borderWidth: 1,
    // borderColor: '#EBEBEB',
  },
});
