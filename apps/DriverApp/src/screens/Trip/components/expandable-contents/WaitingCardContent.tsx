import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Calendar, ChevronUp, Clock, MapPin, Minimize2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { useCountdown } from '../../hooks/use-countdown';
import type { ExpandableSheetContentProps } from '../ExpandableSheet';
import { styles } from './styles';

dayjs.extend(duration);

type Props = ExpandableSheetContentProps & {
  trip: Trip;
};

export const WaitingCardContent = ({ expansion, toggle, t, insets, trip }: Props) => {
  const waitingTime = trip.screenState?.screen === 'waiting' ? (trip.screenState?.countdown ?? 0) : 0;
  const { hours, minutes, seconds } = useCountdown(waitingTime, trip.id);

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
  const isLongTerm = totalSeconds > 86_400;
  const isMediumTerm = totalSeconds > 3600;
  const isTimeUp = totalSeconds <= 0;

  const fillProgress = useSharedValue(0);

  useEffect(() => {
    if (isTimeUp) {
      fillProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withDelay(3500, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    } else {
      fillProgress.value = 0;
    }
  }, [isTimeUp, fillProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(fillProgress.value, [0, 1], [0, 100])}%`,
    opacity: interpolate(fillProgress.value, [0, 0.8, 1], [0.3, 0.3, 0]),
  }));

  const formatSmartTime = () => {
    if (isTimeUp) {
      return t('trip.waiting.start_scanning', 'Start Scanning');
    }
    if (isLongTerm) {
      const days = Math.ceil(totalSeconds / 86_400);
      return t('time.in_days', { count: days });
    }
    if (isMediumTerm) {
      const h = Math.ceil(totalSeconds / 3600);
      return t('time.in_hours', { count: h });
    }
    return `${formatDigits(hours)}:${formatDigits(minutes)}:${formatDigits(seconds)}`;
  };

  const nextActionStation = trip.stations[0];
  const nextActionText = t('trip.waiting.next_action', {
    station: nextActionStation?.name,
  });

  const maxSeconds = 7200;
  const progress = isTimeUp ? 1 : Math.min(totalSeconds / maxSeconds, 1);

  return (
    <>
      <Animated.View style={[styles.floatingBar, { bottom: insets.bottom }, collapsedOpacity]}>
        <Surface elevation={5} style={[styles.barSurface, isTimeUp && styles.barSurfaceActive]}>
          <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={styles.barContent}>
            {!(isLongTerm || isMediumTerm || isTimeUp) && (
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            )}

            {isTimeUp && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.PRIMARY, overflow: 'hidden' }]}>
                <Animated.View style={[styles.fillOverlay, fillStyle]} />
              </View>
            )}

            <View style={styles.timerRow}>
              <View
                style={[
                  styles.iconContainer,
                  (isLongTerm || isMediumTerm) && styles.iconContainerAlt,
                  isTimeUp && styles.iconContainerActive,
                ]}
              >
                {isLongTerm ? (
                  <Calendar color={isTimeUp ? Colors.PRIMARY : Colors.BACKGROUND} size={18} />
                ) : (
                  <Clock color={isTimeUp ? Colors.PRIMARY : Colors.BACKGROUND} size={18} />
                )}
              </View>
              <View>
                <Text style={[styles.timerText, isTimeUp && styles.timerTextActive]} variant="titleMedium">
                  {formatSmartTime()}
                </Text>
                <Text style={[styles.subTimerText, isTimeUp && styles.subTimerTextActive]} variant="bodySmall">
                  {nextActionStation?.name}
                </Text>
              </View>
            </View>
            <View style={[styles.expandButton, isTimeUp && styles.expandButtonActive]}>
              <Text style={[styles.expandText, isTimeUp && styles.expandTextActive]}>
                {isTimeUp ? t('action.scan', 'Scan') : t('action.details', 'Details')}
              </Text>
              <ChevronUp color={isTimeUp ? Colors.BACKGROUND : Colors.PRIMARY} size={18} />
            </View>
          </TouchableOpacity>
        </Surface>
      </Animated.View>

      <Animated.View style={[styles.centeredContainer, expandedOpacity]}>
        <Surface elevation={2} style={styles.cardSurface}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Clock color={Colors.PRIMARY} size={18} />
              </View>
              <Text style={styles.cardTitle} variant="titleLarge">
                {isTimeUp
                  ? t('trip.waiting.ready_to_scan', 'Ready to Scan')
                  : t('trip.waiting.trip_status', 'Trip Status')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={toggle} style={styles.closeButton}>
              <Minimize2 color={Colors.SECONDARY} size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.bigTimerContainer}>
            <View style={[styles.timerGradient, isTimeUp && styles.timerGradientActive]}>
              <Text style={[styles.bigTimerLabel, isTimeUp && styles.bigTimerLabelActive]}>
                {isTimeUp ? t('time.now', 'Now') : t('trip.waiting.departure_in')}
              </Text>
              {isLongTerm || isMediumTerm || isTimeUp ? (
                <Text style={[styles.bigSmartTime, isTimeUp && styles.bigSmartTimeActive]}>{formatSmartTime()}</Text>
              ) : (
                <Text style={styles.bigTimer}>
                  {formatDigits(hours)}
                  <Text style={styles.timerSeparator}>:</Text>
                  {formatDigits(minutes)}
                  <Text style={styles.timerSeparator}>:</Text>
                  {formatDigits(seconds)}
                </Text>
              )}
              <Text style={[styles.departureTimeSub, isTimeUp && styles.departureTimeSubActive]}>
                {dayjs(trip.departureTime).format('dddd, MMM D • h:mm A')}
              </Text>
            </View>
          </View>

          <View style={styles.actionBox}>
            <View style={styles.actionHeader}>
              <MapPin color={Colors.PRIMARY} size={16} />
              <Text style={styles.actionTitle}>{t('trip.waiting.next_step')}</Text>
            </View>
            <Text style={styles.actionDescription}>{nextActionText}</Text>
            <Text style={styles.actionSub}>{t('trip.waiting.prepare_scanner')}</Text>
          </View>

          {trip.stations.at(-1) && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MapPin color={Colors.ACCENT} size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('trip.final_destination')}</Text>
                  <Text style={styles.detailValue}>{trip.stations.at(-1)?.name}</Text>
                </View>
              </View>
            </View>
          )}
        </Surface>
      </Animated.View>
    </>
  );
};
