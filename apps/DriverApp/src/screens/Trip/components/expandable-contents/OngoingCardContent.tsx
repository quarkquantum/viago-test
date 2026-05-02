import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StationStatus } from '@repo/shared/constants';
import { CheckCircle, ChevronUp, Clock, MapPin, Minimize2, Play, QrCode } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { useCountdown } from '../../hooks/use-countdown';
import type { ExpandableSheetContentProps } from '../ExpandableSheet';
import { styles } from './styles';

type Props = ExpandableSheetContentProps & {
  trip: Trip;
  onCompleteStation?: (stationId: string) => void;
  onStartTrip?: (stationId: string) => void;
  onScanTickets?: () => void;
};

export const OngoingCardContent = ({
  expansion,
  toggle,
  t,
  insets,
  trip,
  onCompleteStation,
  onStartTrip,
  onScanTickets,
}: Props) => {
  // Find active or boarding station
  const activeStation = trip.stations.find((s) => s.status === StationStatus.ACTIVE);
  const boardingStation = trip.stations.find((s) => s.status === StationStatus.BOARDING);
  const currentStation = activeStation || boardingStation;

  const isBoarding = !!boardingStation && !activeStation;
  const completionUnlockTime = activeStation?.actions?.completionUnlockTime;
  const canComplete = activeStation?.actions?.canMarkAsCompleted && !activeStation?.actions?.completionDisabled;

  const initialMs = useMemo(
    () => (completionUnlockTime ? new Date(completionUnlockTime).getTime() - Date.now() : 0),
    [completionUnlockTime]
  );

  const { hours, minutes, seconds } = useCountdown(initialMs, trip.id);

  const collapsedOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 0.3], [1, 0]),
    transform: [
      { scale: interpolate(expansion.value, [0, 0.3], [1, 0.95]) },
      { translateY: interpolate(expansion.value, [0, 0.3], [0, 10]) },
    ],
    pointerEvents: expansion.value < 0.3 ? 'auto' : 'none',
  }));

  const expandedOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0.3, 1], [0, 1]),
    transform: [
      { scale: interpolate(expansion.value, [0.3, 1], [0.9, 1]) },
      { translateY: interpolate(expansion.value, [0.3, 1], [20, 0]) },
    ],
    pointerEvents: expansion.value > 0.3 ? 'box-none' : 'none',
  }));

  const formatDigits = (n: number) => n.toString().padStart(2, '0');
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const hasCountdown = completionUnlockTime && totalSeconds > 0;
  const countdownComplete = completionUnlockTime && totalSeconds <= 0;

  const nextStation = trip.stations.find((s) => s.status === StationStatus.PENDING);

  // Determine display state
  const getBarContent = () => {
    if (isBoarding) {
      return {
        title: t('trip.ongoing.boarding', 'Boarding'),
        subtitle: currentStation?.name,
        iconStyle: styles.iconContainerAlt,
      };
    }
    if (hasCountdown) {
      return {
        title: `${hours > 0 ? `${hours}h ` : ''}${formatDigits(minutes)}m ${formatDigits(seconds)}s`,
        subtitle: currentStation?.name,
        iconStyle: styles.iconContainerSuccess,
      };
    }
    if (countdownComplete && canComplete) {
      return {
        title: t('trip.ongoing.ready_to_complete', 'Ready'),
        subtitle: currentStation?.name,
        iconStyle: styles.iconContainerSuccess,
      };
    }
    return {
      title: t('trip.ongoing.on_trip', 'On Trip'),
      subtitle: currentStation?.name,
      iconStyle: styles.iconContainer,
    };
  };

  const barContent = getBarContent();

  return (
    <>
      {/* Collapsed View (Bottom Bar) */}
      <Animated.View style={[styles.floatingBar, { bottom: insets.bottom }, collapsedOpacity]}>
        <Surface elevation={5} style={styles.barSurface}>
          <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={styles.barContent}>
            <View style={styles.timerRow}>
              <View style={barContent.iconStyle}>
                <Clock color={Colors.BACKGROUND} size={18} />
              </View>
              <View>
                <Text style={styles.timerText} variant="titleMedium">
                  {barContent.title}
                </Text>
                <Text style={styles.subTimerText} variant="bodySmall">
                  {barContent.subtitle}
                </Text>
              </View>
            </View>
            <View style={styles.expandButton}>
              <Text style={styles.expandText}>{t('action.details', 'Details')}</Text>
              <ChevronUp color={Colors.PRIMARY} size={18} />
            </View>
          </TouchableOpacity>
        </Surface>
      </Animated.View>

      {/* Expanded View (Centered Card) */}
      <Animated.View style={[styles.centeredContainer, expandedOpacity]}>
        <Surface elevation={2} style={styles.cardSurface}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Clock color={Colors.PRIMARY} size={18} />
              </View>
              <Text style={styles.cardTitle} variant="titleLarge">
                {isBoarding
                  ? t('trip.ongoing.boarding_progress', 'Boarding')
                  : t('trip.ongoing.trip_progress', 'Trip Progress')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={toggle} style={styles.closeButton}>
              <Minimize2 color={Colors.SECONDARY} size={16} />
            </TouchableOpacity>
          </View>

          {/* Big Timer / Status */}
          <View style={styles.bigTimerContainer}>
            <View style={[styles.timerGradient, countdownComplete && canComplete && styles.timerGradientActive]}>
              <Text style={[styles.bigTimerLabel, countdownComplete && canComplete && styles.bigTimerLabelActive]}>
                {isBoarding
                  ? t('trip.ongoing.current_station')
                  : hasCountdown
                    ? t('trip.ongoing.can_complete_in', 'Can complete in')
                    : countdownComplete && canComplete
                      ? t('trip.ongoing.station_ready', 'Station Ready')
                      : t('trip.ongoing.current_station')}
              </Text>

              {isBoarding ? (
                <Text style={styles.bigSmartTime}>{currentStation?.name}</Text>
              ) : hasCountdown ? (
                <Text style={styles.bigTimerSuccess}>
                  {formatDigits(hours)}
                  <Text style={styles.timerSeparatorSuccess}>:</Text>
                  {formatDigits(minutes)}
                  <Text style={styles.timerSeparatorSuccess}>:</Text>
                  {formatDigits(seconds)}
                </Text>
              ) : countdownComplete && canComplete ? (
                <Text style={[styles.bigSmartTime, styles.bigSmartTimeActive]}>
                  {t('trip.ongoing.complete_now', 'Complete Now')}
                </Text>
              ) : (
                <Text style={styles.bigSmartTime}>{currentStation?.name}</Text>
              )}

              <Text
                style={[styles.departureTimeSub, countdownComplete && canComplete && styles.departureTimeSubActive]}
              >
                {nextStation
                  ? `${t('trip.ongoing.next_stop', 'Next:')} ${nextStation.name}`
                  : t('trip.ongoing.final_station', 'Final station')}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={localStyles.actionsContainer}>
            {isBoarding && (
              <>
                {boardingStation?.actions?.canStartTrip && onStartTrip && (
                  <Button
                    buttonColor={Colors.PRIMARY}
                    icon={() => <Play color={Colors.BACKGROUND} size={16} />}
                    labelStyle={localStyles.buttonLabel}
                    mode="contained"
                    onPress={() => onStartTrip(boardingStation.id)}
                    style={localStyles.actionButton}
                  >
                    {t('trips.actions.startTrip', 'Start Trip')}
                  </Button>
                )}
                {boardingStation?.actions?.canScanTickets && onScanTickets && (
                  <Button
                    buttonColor={Colors.SUCCESS}
                    icon={() => <QrCode color={Colors.BACKGROUND} size={16} />}
                    labelStyle={localStyles.buttonLabel}
                    mode="contained"
                    onPress={onScanTickets}
                    style={localStyles.actionButton}
                  >
                    {t('trips.actions.scanTicket', 'Scan Ticket')}
                  </Button>
                )}
              </>
            )}

            {!isBoarding && countdownComplete && canComplete && onCompleteStation && activeStation && (
              <Button
                buttonColor={Colors.SUCCESS}
                icon={() => <CheckCircle color={Colors.BACKGROUND} size={16} />}
                labelStyle={localStyles.buttonLabel}
                mode="contained"
                onPress={() => onCompleteStation(activeStation.id)}
                style={localStyles.actionButton}
              >
                {t('trips.actions.finishStation', 'Complete Station')}
              </Button>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.actionBox}>
            <View style={styles.actionHeader}>
              <MapPin color={Colors.PRIMARY} size={16} />
              <Text style={styles.actionTitle}>
                {isBoarding ? t('trip.ongoing.boarding_status', 'Boarding') : t('trip.ongoing.route_status', 'Route')}
              </Text>
            </View>
            <Text style={styles.actionDescription}>
              {isBoarding
                ? t('trip.ongoing.passengers_boarding', 'Passengers are boarding')
                : t('trip.ongoing.passengers_en_route', 'Passengers en route')}
            </Text>
          </View>
        </Surface>
      </Animated.View>
    </>
  );
};

const localStyles = StyleSheet.create({
  actionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
  },
  buttonLabel: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
});
