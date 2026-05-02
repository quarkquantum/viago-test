import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bus, MapPin, Navigation, Signal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import type { CurrentTrip } from '@/features/me/api/use-get-dashboard';

dayjs.extend(relativeTime);

type Props = {
  trip: NonNullable<CurrentTrip>;
  onPress?: () => void;
};

export const CurrentTripCard = ({ trip, onPress }: Props) => {
  const { t } = useTranslation();

  // Find current station
  const currentStation = trip.stations.find((s) => s.status === 'ONGOING' || s.status === 'PENDING');
  const nextStation = !currentStation && trip.stations.find((s) => s.status === 'PENDING');

  const activeStation = currentStation || nextStation || trip.stations[0];

  return (
    <Surface elevation={4} style={styles.card}>
      <TouchableRipple borderless onPress={onPress} style={styles.ripple}>
        <View style={styles.container}>
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View style={styles.liveBadge}>
              <Signal color={Colors.PRIMARY} size={14} />
              <Text style={styles.liveText}>{t('common.live').toUpperCase()}</Text>
            </View>
            <View style={styles.busInfo}>
              <Bus color={Colors.SECONDARY} size={16} />
              <Text style={styles.busText}>{trip.bus.licensePlate || t('common.na')}</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.stationInfo}>
              <Text style={styles.label}>{currentStation ? t('trips.current_station') : t('trips.next_station')}</Text>
              <View style={styles.stationRow}>
                <MapPin color={Colors.PRIMARY} size={20} />
                <Text style={styles.stationName}>{activeStation?.name}</Text>
              </View>
              <Text style={styles.cityText}>{activeStation?.city?.name}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Navigation color={Colors.SECONDARY} size={16} />
                {/* <Text style={styles.statValue}>{trip.distance} km</Text> */}
                <Text style={styles.statLabel}>{t('trips.total_distance')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{trip._count.bookings}</Text>
                <Text style={styles.statLabel}>{t('trips.total_passengers')}</Text>
              </View>
            </View>
          </View>

          {/* Action Footer Indicator */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('screens.home.tap_to_view_details')}</Text>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
    margin: 4,
    overflow: 'hidden',
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  ripple: {
    borderRadius: 20,
  },
  container: {
    padding: 0,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: `${Colors.PRIMARY}10`,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.PRIMARY}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: Colors.PRIMARY,
    letterSpacing: 1,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  busText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  mainContent: {
    padding: 16,
  },
  stationInfo: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
    marginBottom: 4,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  stationName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  cityText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.SECONDARY,
    marginLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.ACCENT,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.SECONDARY,
  },
  footer: {
    padding: 10,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.ACCENT,
    opacity: 0.7,
  },
});
