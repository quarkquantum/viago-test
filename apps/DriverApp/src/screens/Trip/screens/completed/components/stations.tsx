import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';

export const StationsList = ({ trip }: { trip: Trip }) => (
  <View style={styles.stationsSection}>
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
      {trip.stations.map((station, index) => (
        <View key={station.id}>
          <View style={styles.stationRow}>
            <View
              style={[
                styles.stationDot,
                index === 0 && styles.stationDotStart,
                index === trip.stations.length - 1 && styles.stationDotEnd,
              ]}
            />
            <Text numberOfLines={1} style={styles.stationText}>
              {station.name}
            </Text>
          </View>
          {index < trip.stations.length - 1 && <View style={styles.stationConnector} />}
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 200,
  },
  stationsSection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.TEXT}10`,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: `${Colors.TEXT}30`,
  },
  stationDotStart: {
    backgroundColor: Colors.PRIMARY,
  },
  stationDotEnd: {
    backgroundColor: Colors.SECONDARY,
  },
  stationConnector: {
    width: 2,
    height: 20,
    backgroundColor: `${Colors.PRIMARY}30`,
    marginLeft: 4,
    marginVertical: 4,
  },
  stationText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.TEXT,
    flex: 1,
  },
});
