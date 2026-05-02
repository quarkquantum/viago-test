import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CheckCircle, QrCode } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useCountdown } from '@/screens/Trip/hooks/use-countdown';
import type { Trip } from '../../api/use-get-trip';

dayjs.extend(relativeTime);

type StationActionButtonsProps = {
  actions: Trip['stations'][number]['actions'];
  onArrive: () => void;
  onStartBoarding: () => void;
  onStartTrip: () => void;
  onFinish: () => void;
  onScanTickets: () => void;
  onViewPassengers: () => void;
  tripId: string;
};

export const StationActionButtons = ({
  actions,
  onArrive,
  onStartBoarding,
  onStartTrip,
  onFinish,
  onScanTickets,
  onViewPassengers,
  tripId,
}: StationActionButtonsProps) => {
  const { t } = useTranslation();

  const initialMs = useMemo(
    () => (actions?.completionUnlockTime ? new Date(actions.completionUnlockTime).getTime() - Date.now() : 0),
    [actions?.completionUnlockTime]
  );

  const { hours, minutes, seconds } = useCountdown(initialMs, tripId);

  // Early return after all hooks are called
  if (!actions) {
    return null;
  }

  const {
    canMarkAsBoarding,
    canMarkAsActive,
    canMarkAsCompleted,
    canScanTickets,
    completionDisabled,
    completionUnlockTime,
    isCompleted,
    canStartTrip,
  } = actions;

  const formatCountdown = () => {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.actionRow}>
      {/* Arrive Station - Shown when station hasn't been marked for boarding yet */}
      {!canMarkAsBoarding && (
        <Button
          buttonColor={Colors.SECONDARY}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onArrive}
          style={styles.actionButton}
        >
          {t('trips.actions.arriveStation')}
        </Button>
      )}

      {/* Start Boarding - Shown when ready to begin boarding passengers */}
      {canMarkAsActive && (
        <Button
          buttonColor={Colors.SECONDARY}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onStartBoarding}
          style={styles.actionButton}
        >
          {t('trips.actions.startBoarding')}
        </Button>
      )}

      {/* Start Trip (From Boarding to Active) */}
      {canStartTrip && (
        <Button
          buttonColor={Colors.PRIMARY}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onStartTrip}
          style={styles.actionButton}
        >
          {t('trips.actions.startTrip')}
        </Button>
      )}

      {/* Scan Tickets - Shown during active boarding */}
      {canScanTickets && (
        <Button
          buttonColor={Colors.PRIMARY}
          icon={() => <QrCode color={Colors.BACKGROUND} size={16} />}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onScanTickets}
          style={styles.actionButton}
        >
          {t('trips.actions.scanTicket')}
        </Button>
      )}

      {/* Finish Station - Mark station as complete */}
      {canMarkAsCompleted && !isCompleted && (
        <Button
          buttonColor={Colors.SUCCESS}
          disabled={completionDisabled}
          icon={() => <CheckCircle color={Colors.BACKGROUND} size={16} />}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onFinish}
          style={styles.actionButton}
        >
          {completionDisabled && completionUnlockTime
            ? t('trips.actions.finishStationLocked', {
                time: formatCountdown(),
              })
            : t('trips.actions.finishStation')}
        </Button>
      )}

      {/* Completed State - Station already marked as complete */}
      {isCompleted && (
        <Button
          buttonColor={Colors.SUCCESS}
          disabled
          icon={() => <CheckCircle color={Colors.BACKGROUND} size={16} />}
          labelStyle={styles.actionLabel}
          mode="contained"
          style={styles.actionButton}
        >
          {t('trips.actions.stationCompleted', 'Completed')}
        </Button>
      )}

      <Button
        labelStyle={styles.secondaryActionLabel}
        mode="outlined"
        onPress={onViewPassengers}
        style={styles.secondaryActionButton}
      >
        {t('trips.actions.viewPassengers')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  actionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  secondaryActionButton: {
    marginTop: 8,
    borderRadius: 8,
    borderColor: Colors.SECONDARY,
  },
  secondaryActionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.SECONDARY,
  },
  actionRow: {
    flexDirection: 'column',
    gap: 8,
  },
});
