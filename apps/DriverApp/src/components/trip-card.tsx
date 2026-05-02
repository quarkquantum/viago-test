import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors, TripStatus } from '@repo/shared';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bus, Calendar, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import type { UpcomingTrip } from '@/features/me/api/use-get-dashboard';
import dayjs from '@/utils/dayjs';

dayjs.extend(relativeTime);

type Props = {
  trip: UpcomingTrip;
  onPress?: () => void;
};

export const TripCard = ({ trip, onPress }: Props) => {
  const { t } = useTranslation();

  const formatTime = (dateStr: string) => dayjs(dateStr).format('HH:mm');
  const formatFullDate = (dateStr: string) => dayjs(dateStr).format('ddd, DD MMM');

  // Sort stations by order
  const sortedStations = [...(trip.stations || [])].sort((a, b) => a.order - b.order);
  const departure = sortedStations[0];
  const arrival = sortedStations.at(-1);
  const intermediateStations = sortedStations.slice(1, -1);

  const departureDate = dayjs(trip.departureTime);
  const isOngoing = trip.status === TripStatus.ONGOING;

  const getRemainingTime = () => {
    if (isOngoing) {
      return t('trips.status.ongoing');
    }
    return departureDate.fromNow();
  };

  return (
    <Surface elevation={isOngoing ? 3 : 1} style={[styles.card, isOngoing && styles.ongoingCard]}>
      <TouchableRipple borderless onPress={onPress} style={styles.ripple}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.busInfo}>
              <Bus color={Colors.SECONDARY} size={16} />
              <Text style={styles.busText}>{trip.bus.licensePlate || trip.bus.title || t('common.na')}</Text>
            </View>
            <Text style={styles.agency}>{trip.agency.name}</Text>
          </View>

          {/* Route Info */}
          <View style={styles.routeContainer}>
            {/* Departure Station */}
            <View style={styles.stationRow}>
              <View style={styles.timeCol}>
                <Text style={styles.time}>{formatTime(departure?.departureTime || trip.departureTime)}</Text>
              </View>
              <View style={styles.indicatorCol}>
                <View style={[styles.dot, styles.departureDot]} />
                <View style={[styles.line, isOngoing && styles.ongoingLine]} />
              </View>
              <View style={styles.nameCol}>
                <Text style={styles.stationName}>{departure?.name || t('common.na')}</Text>
              </View>
            </View>

            {/* Intermediate Stations - Simple indicator */}
            {intermediateStations.length > 0 && (
              <View style={styles.stationRow}>
                <View style={styles.timeCol} />
                <View style={styles.indicatorCol}>
                  <View style={styles.thinLine} />
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.stopsCount}>
                    {intermediateStations.length}{' '}
                    {intermediateStations.length === 1 ? t('trips.stop') : t('trips.stops')}
                  </Text>
                </View>
              </View>
            )}

            {/* Arrival Station */}
            <View style={styles.stationRow}>
              <View style={styles.timeCol}>
                <Text style={styles.time}>{formatTime(arrival?.departureTime || trip.arrivalTime)}</Text>
              </View>
              <View style={styles.indicatorCol}>
                <MapPin color={isOngoing ? Colors.PRIMARY : Colors.SECONDARY} size={18} />
              </View>
              <View style={styles.nameCol}>
                <Text style={styles.stationName}>{arrival?.name || t('common.na')}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.dateInfo}>
              <Calendar color={Colors.ACCENT} size={16} />
              <Text style={styles.fullDateText}>{formatFullDate(trip.departureTime)}</Text>
            </View>
            <View style={[styles.badge, isOngoing ? styles.ongoingBadge : styles.futureBadge]}>
              <Text style={[styles.badgeText, isOngoing ? styles.ongoingBadgeText : styles.futureBadgeText]}>
                {getRemainingTime()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.BACKGROUND,
    margin: 4,
    overflow: 'hidden',
    borderColor: Colors.ACCENT_FOREGROUND,
    borderWidth: 1,
  },
  ongoingCard: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  ripple: {
    borderRadius: 16,
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  busText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.ACCENT,
  },
  agency: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.SECONDARY,
  },
  routeContainer: {
    marginBottom: 16,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  timeCol: {
    width: 60,
  },
  time: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.ACCENT,
  },
  timeSmall: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.ACCENT,
  },
  indicatorCol: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.SECONDARY,
  },
  departureDot: {
    backgroundColor: Colors.PRIMARY,
    borderWidth: 2,
    borderColor: Colors.BACKGROUND,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    marginVertical: 2,
  },
  thinLine: {
    width: 1,
    height: 32,
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  ongoingLine: {
    backgroundColor: `${Colors.PRIMARY}40`,
  },
  nameCol: {
    flex: 1,
  },
  stationName: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.ACCENT,
  },
  stopsCount: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ACCENT_FOREGROUND,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullDateText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.ACCENT,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingBadge: {
    backgroundColor: `${Colors.PRIMARY}15`,
  },
  futureBadge: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ongoingBadgeText: {
    color: Colors.PRIMARY,
  },
  futureBadgeText: {
    color: Colors.ACCENT,
  },
});
