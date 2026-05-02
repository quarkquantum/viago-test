import { Colors } from '@repo/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useCountdown } from '../hooks/use-countdown';

type Props = {
  tripId: string;
  countdown: number;
  message: string;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLLAPSED_HEIGHT = 80;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.7;

export const ExpandableTimer = ({ countdown, message, tripId }: Props) => {
  const { t } = useTranslation();
  const { hours, minutes, seconds } = useCountdown(countdown, tripId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
  });

  const borderRadiusInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const opacityInterpolate = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
      {/* Backdrop overlay */}
      {isExpanded && <Pressable onPress={toggleExpand} style={styles.backdrop} />}

      {/* Expandable timer container */}
      <Animated.View
        style={[
          styles.container,
          {
            height: heightInterpolate,
            borderRadius: borderRadiusInterpolate,
          },
        ]}
      >
        <Pressable onPress={toggleExpand} style={styles.pressable}>
          {/* Collapsed view - always visible */}
          <View style={styles.collapsedContent}>
            <View style={styles.handle} />
            <View style={styles.timerRow}>
              <Text style={styles.label}>{t('trips.remainingTime')}</Text>
              <Text style={styles.timerText} variant="titleLarge">
                {hours}h {minutes}m {seconds}s
              </Text>
            </View>
          </View>

          {/* Expanded content - only visible when expanded */}
          <Animated.View
            pointerEvents={isExpanded ? 'auto' : 'none'}
            style={[styles.expandedContent, { opacity: opacityInterpolate }]}
          >
            <View style={styles.expandedInner}>
              <Text style={styles.expandedTitle} variant="headlineMedium">
                {t('trips.tripCountdown')}
              </Text>

              <View style={styles.bigTimerContainer}>
                <Text style={styles.bigTimerText}>{String(hours).padStart(2, '0')}</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.bigTimerText}>{String(minutes).padStart(2, '0')}</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.bigTimerText}>{String(seconds).padStart(2, '0')}</Text>
              </View>

              <View style={styles.labelsContainer}>
                <Text style={styles.timeLabel}>{t('common.hours')}</Text>
                <Text style={styles.timeLabel}>{t('common.minutes')}</Text>
                <Text style={styles.timeLabel}>{t('common.seconds')}</Text>
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.expandedMessage}>{t(message)}</Text>
              </View>

              <Text style={styles.tapToClose}>{t('common.tapToClose')}</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
  container: {
    width: '90%',
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    backgroundColor: Colors.BACKGROUND,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  pressable: {
    flex: 1,
  },
  collapsedContent: {
    height: COLLAPSED_HEIGHT,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.TEXT,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.TEXT,
    fontWeight: '500',
  },
  timerText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  expandedContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  expandedInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedTitle: {
    color: Colors.TEXT,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  bigTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bigTimerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginHorizontal: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageContainer: {
    backgroundColor: Colors.BACKGROUND,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  expandedMessage: {
    fontSize: 16,
    color: Colors.ACCENT,
    textAlign: 'center',
    lineHeight: 24,
  },
  tapToClose: {
    fontSize: 14,
    color: Colors.TEXT,
    fontStyle: 'italic',
  },
});
