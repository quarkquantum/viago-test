import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors, TripStatus } from '@repo/shared';
import { Play, QrCode } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import type { Trip } from '../api/use-get-trip';

type TripStatusViewProps = {
  trip: Trip;
  onStartTrip: () => void;
  onScanTickets: () => void;
  loading?: boolean;
  canStartTrip?: boolean;
  canScanTickets?: boolean;
};

export const TripStatusView = ({
  trip,
  onStartTrip,
  onScanTickets,
  loading,
  canStartTrip = false,
  canScanTickets = false,
}: TripStatusViewProps) => {
  const { t } = useTranslation();
  const { status } = trip;

  if (status === TripStatus.COMPLETED) {
    return (
      <View style={styles.centered}>
        <Text style={styles.endedText}>{t('trips.details.ended')}</Text>
      </View>
    );
  }

  if (status !== TripStatus.PENDING && status !== TripStatus.ONGOING) {
    return null;
  }

  return (
    <Surface elevation={1} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>{t('trips.details.status')}</Text>
          <View style={styles.badge}>
            <View
              style={[
                styles.dot,
                { backgroundColor: status === TripStatus.PENDING ? Colors.SUCCESS : Colors.SECONDARY },
              ]}
            />
            <Text style={styles.statusText}>
              {status === TripStatus.PENDING ? t('trips.status.active') : t('trips.status.ongoing')}
            </Text>
          </View>
        </View>

        {canStartTrip && (
          <Button
            contentStyle={styles.buttonContent}
            icon={({ size, color }) => <Play color={color} size={size} />}
            loading={loading}
            mode="contained"
            onPress={onStartTrip}
            style={styles.startButton}
          >
            {t('trips.actions.startTrip')}
          </Button>
        )}

        {canScanTickets && (
          <Button
            contentStyle={styles.buttonContent}
            icon={({ size, color }) => <QrCode color={color} size={size} />}
            mode="contained"
            onPress={onScanTickets}
            style={styles.scanButton}
          >
            {t('trips.actions.scanTicket')}
          </Button>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    gap: 4,
  },
  statusLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
    textTransform: 'uppercase',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  startButton: {
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
  },
  scanButton: {
    borderRadius: 8,
    backgroundColor: Colors.ACCENT,
  },
  buttonContent: {
    height: 40,
    paddingHorizontal: 8,
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  endedText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
});
