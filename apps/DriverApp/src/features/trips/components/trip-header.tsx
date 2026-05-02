import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors, TripStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Building2, Bus, Calendar, ChevronDown, Clock, MapPin, Route } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { Trip } from '../api/use-get-trip';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TripHeaderProps = {
  trip: Trip;
};

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

const TRIP_STATUS_COLORS: Record<string, string> = {
  [TripStatus.PENDING]: '#2196F3',
  [TripStatus.ONGOING]: '#4CAF50',
  [TripStatus.COMPLETED]: '#9C27B0',
  [TripStatus.CANCELLED]: '#F44336',
  [TripStatus.DELETED]: '#607D8B',
};

const getTripStatusColor = (status: string) => TRIP_STATUS_COLORS[status] ?? '#9E9E9E';

const getTripStatus = (status: string) => {
  switch (status) {
    case TripStatus.PENDING:
      return 'trips.status.active';
    case TripStatus.ONGOING:
      return 'trips.status.ongoing';
    case TripStatus.COMPLETED:
      return 'trips.status.completed';
    case TripStatus.CANCELLED:
      return 'trips.status.cancelled';
    case TripStatus.DELETED:
      return 'trips.status.deleted';
    default:
      return 'trips.status.unknown';
  }
};

export const TripHeader = ({ trip }: TripHeaderProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const formatTime = (dateStr: string) => dayjs(dateStr).format('HH:mm');
  const formatDate = (dateStr: string) => dayjs(dateStr).format('ddd, DD MMM YYYY');

  const statusColor = getTripStatusColor(trip.status);

  const toggleExpand = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setIsExpanded(!isExpanded);
  };

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withSpring(isExpanded ? '0deg' : '180deg', {
          damping: 160,
          stiffness: 1600,
        }),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Section - Always Visible */}
        <Pressable onPress={toggleExpand} style={styles.headerPressable}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
                  {trip.name}
                </Text>
                {/* <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusColors.bg,
                      borderColor: statusColors.border,
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {getTripStatusLabel(trip.status)}
                  </Text>
                </View> */}
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar color={Colors.SECONDARY} size={14} />
                  <Text style={styles.metaText}>{formatDate(trip.departureTime)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.metaText, { color: statusColor }]}>{t(getTripStatus(trip.status))}</Text>
                </View>
              </View>
            </View>
            <Animated.View style={chevronAnimatedStyle}>
              <ChevronDown color={Colors.SECONDARY} size={24} />
            </Animated.View>
          </View>
        </Pressable>

        {/* Collapsible Content */}
        {isExpanded && (
          <>
            {/* Route Section */}
            <View style={styles.routeSection}>
              <View style={styles.routeRow}>
                <View style={styles.timePoint}>
                  <View style={styles.iconCircle}>
                    <Clock color={Colors.PRIMARY} size={18} />
                  </View>
                  <View style={styles.timeInfo}>
                    <Text style={styles.time}>{formatTime(trip.departureTime)}</Text>
                    <Text style={styles.label}>Departure</Text>
                  </View>
                </View>

                <View style={styles.routeLine}>
                  <View style={styles.dottedLine} />
                  <View style={styles.durationBadge}>
                    <Route color={Colors.PRIMARY} size={12} />
                    <Text style={styles.durationText}>{formatDuration(trip.duration)}</Text>
                  </View>
                </View>

                <View style={[styles.timePoint, styles.timePointEnd]}>
                  <View style={styles.timeInfo}>
                    <Text style={styles.time}>{formatTime(trip.arrivalTime)}</Text>
                    <Text style={styles.label}>Arrival</Text>
                  </View>
                  <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
                    <MapPin color={Colors.SECONDARY} size={18} />
                  </View>
                </View>
              </View>

              {/* Distance Info */}
              <View style={styles.distanceRow}>
                <Text style={styles.distanceText}>
                  {trip.distance} km • {trip._count.stations} stations
                </Text>
              </View>
            </View>

            {/* Bus Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Bus color={Colors.PRIMARY} size={20} />
                </View>
                <View style={styles.infoDetails}>
                  <Text style={styles.infoTitle}>{trip.bus.title}</Text>
                  <Text style={styles.infoSubtitle}>{trip.bus.licensePlate}</Text>
                </View>
              </View>

              {/* Agency Info */}
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, styles.iconContainerSecondary]}>
                  <Building2 color={Colors.SECONDARY} size={20} />
                </View>
                <View style={styles.infoDetails}>
                  <Text style={styles.infoTitle}>{trip.agency.name}</Text>
                  <Text style={styles.infoSubtitle}>Agency</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.BACKGROUND,
    // borderWidth: 1.5,
    borderColor: Colors.CARD,
    // overflow: 'hidden',
  },
  headerPressable: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    minHeight: 28, // Add minimum height to accommodate badge
    width: '100%',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
    flex: 1,
    flexShrink: 1, // Add this to allow title to shrink
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0, // Add this to prevent badge from shrinking
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.SECONDARY,
  },
  routeSection: {
    marginBottom: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_FOREGROUND,
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
    gap: 10,
    flex: 1,
  },
  timePointEnd: {
    justifyContent: 'flex-end',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 16,
    color: Colors.ACCENT,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 11,
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
    borderColor: Colors.SECONDARY,
    opacity: 0.3,
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
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  durationText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.PRIMARY,
  },
  distanceRow: {
    alignItems: 'center',
  },
  distanceText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
  infoSection: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSecondary: {
    backgroundColor: `${Colors.SECONDARY}15`,
  },
  infoDetails: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  infoSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
