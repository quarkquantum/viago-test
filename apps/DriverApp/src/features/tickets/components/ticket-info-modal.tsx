import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { TicketStatus } from '@repo/shared/constants';
import { CheckCircle, MapPin, User, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

type TicketInfoModalProps = {
  ticket: any;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export const TicketInfoModal = ({ ticket, onCancel, onConfirm, isLoading }: TicketInfoModalProps) => {
  const { t } = useTranslation();

  if (!ticket) {
    return null;
  }

  const isConsumed = ticket.status === TicketStatus.CONSUMED;

  return (
    <View style={styles.container}>
      <Surface elevation={4} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('ticketDetails.details')}</Text>
          {isConsumed ? (
            <View style={[styles.statusBadge, styles.consumedBadge]}>
              <XCircle color={Colors.DESTRUCTIVE} size={16} />
              <Text style={[styles.statusText, { color: Colors.DESTRUCTIVE }]}>
                {t('ticketDetails.alreadyScanned')}
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.validBadge]}>
              <CheckCircle color={Colors.SUCCESS} size={16} />
              <Text style={[styles.statusText, { color: Colors.SUCCESS }]}>{t('ticketDetails.valid')}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <User color={Colors.SECONDARY} size={20} />
            <View style={styles.info}>
              <Text style={styles.label}>{t('settings.name')}</Text>
              <Text style={styles.value}>{ticket.passenger.fullName}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <MapPin color={Colors.SECONDARY} size={20} />
            <View style={styles.info}>
              <Text style={styles.label}>{t('trips.details.departure')}</Text>
              <Text style={styles.value}>{ticket.booking.fromStation.name}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <MapPin color={Colors.SECONDARY} size={20} />
            <View style={styles.info}>
              <Text style={styles.label}>{t('trips.details.arrival')}</Text>
              <Text style={styles.value}>{ticket.booking.toStation.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button disabled={isLoading} mode="outlined" onPress={onCancel} style={styles.button}>
            {t('common.cancel')}
          </Button>
          {!isConsumed && (
            <Button
              disabled={isLoading}
              loading={isLoading}
              mode="contained"
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: Colors.PRIMARY }]}
            >
              {t('common.confirm')}
            </Button>
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'flex-end',
  },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validBadge: {
    backgroundColor: `${Colors.SUCCESS}15`,
  },
  consumedBadge: {
    backgroundColor: `${Colors.DESTRUCTIVE}15`,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  section: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.TEXT,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
});
