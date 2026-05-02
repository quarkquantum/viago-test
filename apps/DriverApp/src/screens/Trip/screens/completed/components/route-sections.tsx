import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { Clock, MapPin, Route } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';

const formatDuration = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};

const formatTime = (dateStr: string) => dayjs(dateStr).format('HH:mm');

export const RouteSection = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.routeSection}>
      <View style={styles.routeRow}>
        <View style={styles.timePoint}>
          <View style={styles.iconCircle}>
            <Clock color={Colors.PRIMARY} size={18} />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.time}>{formatTime(trip.departureTime)}</Text>
            <Text style={styles.label}>{t('trips.details.departure')}</Text>
          </View>
        </View>

        <View style={styles.routeLine}>
          <View style={styles.dottedLine} />
          <View style={styles.durationBadge}>
            <Route color={Colors.SUCCESS} size={12} />
            <Text style={styles.durationText}>{formatDuration(trip.duration)}</Text>
          </View>
        </View>

        <View style={[styles.timePoint, { justifyContent: 'flex-end' }]}>
          <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
            <MapPin color={Colors.SECONDARY} size={18} />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.time}>{formatTime(trip.arrivalTime)}</Text>
            <Text style={styles.label}>{t('trips.details.arrival')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.distanceRow}>
        <Text style={styles.distanceText}>
          {trip.distance} km • {trip._count.stations} stops
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  routeSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.TEXT}10`,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  timePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSecondary: {
    backgroundColor: `${Colors.SECONDARY}15`,
  },
  timeInfo: {
    gap: 2,
  },
  time: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    color: Colors.ACCENT,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.SECONDARY,
    textTransform: 'uppercase',
  },
  routeLine: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dottedLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.SUCCESS,
    opacity: 0.4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.SUCCESS}30`,
  },
  durationText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: Colors.SUCCESS,
  },
  distanceRow: {
    alignItems: 'center',
  },
  distanceText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.SECONDARY,
  },
});
