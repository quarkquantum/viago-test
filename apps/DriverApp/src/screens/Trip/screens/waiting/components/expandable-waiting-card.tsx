import { BlurView } from '@react-native-community/blur';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { TFunction } from 'i18next';
import { Calendar, ChevronUp, Clock, MapPin, Minimize2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { useCountdown } from '../../../hooks/use-countdown';
import { styles } from './styles';

dayjs.extend(duration);

type Props = {
  trip: Trip;
};

export const ExpandableWaitingCard = ({ trip }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const expansion = useSharedValue(1);

  const waitingTime = trip.screenState?.screen === 'waiting' ? (trip.screenState?.countdown ?? 0) : 0;
  const { hours, minutes, seconds } = useCountdown(waitingTime, trip.id);

  const toggleExpansion = () => {
    if (expansion.value === 0) {
      expansion.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      expansion.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 1], [0, 1]),
    zIndex: expansion.value === 0 ? -1 : 2,
    pointerEvents: expansion.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <>
      {/* Expanded Backdrop (Blur) */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <BlurView
          blurAmount={20}
          blurType="dark"
          reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity activeOpacity={1} onPress={toggleExpansion} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* The Floating Card / Bar */}
      <AnimatedContent
        expansion={expansion}
        insets={insets}
        t={t}
        time={{ hours, minutes, seconds }}
        toggle={toggleExpansion}
        trip={trip}
      />
    </>
  );
};

type AnimatedContentProps = {
  expansion: SharedValue<number>;
  toggle: () => void;
  time: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  t: TFunction;
  insets: EdgeInsets;
  trip: Trip;
};

const AnimatedContent = ({ expansion, toggle, time, t, insets, trip }: AnimatedContentProps) => {
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

  const { hours, minutes, seconds } = time;
  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  // Determine display mode based on total seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const isLongTerm = totalSeconds > 86_400; // > 24 hours
  const isMediumTerm = totalSeconds > 3600; // > 1 hour
  const isTimeUp = totalSeconds <= 0;

  // Filling Animation
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    if (isTimeUp) {
      fillProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), // Fill in 1.5s
          withDelay(3500, withTiming(0, { duration: 0 })) // Wait 3.5s then reset instantly
        ),
        -1, // Infinite
        false
      );
    } else {
      fillProgress.value = 0;
    }
  }, [isTimeUp, fillProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(fillProgress.value, [0, 1], [0, 100])}%`,
    opacity: interpolate(fillProgress.value, [0, 0.8, 1], [0.3, 0.3, 0]), // Fade out at end
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
    // Short term: Countdown
    return `${formatDigits(hours)}:${formatDigits(minutes)}:${formatDigits(seconds)}`;
  };

  const nextActionStation = trip.stations[0];
  const nextActionText = t('trip.waiting.next_action', {
    station: nextActionStation?.name,
  });

  // Calculate progress percentage (example: 2 hours = 100%)
  const maxSeconds = 7200; // 2 hours
  const progress = isTimeUp ? 1 : Math.min(totalSeconds / maxSeconds, 1);

  return (
    <>
      {/* Collapsed View (Bottom Bar) */}
      <Animated.View style={[styles.floatingBar, { bottom: insets.bottom }, collapsedOpacity]}>
        <Surface elevation={5} style={[styles.barSurface, isTimeUp && styles.barSurfaceActive]}>
          <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={styles.barContent}>
            {/* Progress indicator */}
            {!(isLongTerm || isMediumTerm || isTimeUp) && (
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            )}

            {/* Active State Background Fill + Filling Effect */}
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
                {isTimeUp
                  ? t('trip.waiting.ready_to_scan', 'Ready to Scan')
                  : t('trip.waiting.trip_status', 'Trip Status')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={toggle} style={styles.closeButton}>
              <Minimize2 color={Colors.SECONDARY} size={16} />
            </TouchableOpacity>
          </View>

          {/* Big Timer / Status */}
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

          {/* Contextual Action Box */}
          <View style={styles.actionBox}>
            <View style={styles.actionHeader}>
              <MapPin color={Colors.PRIMARY} size={16} />
              <Text style={styles.actionTitle}>{t('trip.waiting.next_step')}</Text>
            </View>
            <Text style={styles.actionDescription}>{nextActionText}</Text>
            <Text style={styles.actionSub}>{t('trip.waiting.prepare_scanner')}</Text>
          </View>

          {/* Trip Details */}
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
