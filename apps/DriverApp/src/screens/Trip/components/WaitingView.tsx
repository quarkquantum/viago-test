import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useCountdown } from '../hooks/use-countdown';

type Props = {
  tripId: string;
  countdown: number;
  message: string;
};

export const WaitingView = ({ countdown, message, tripId }: Props) => {
  const { t } = useTranslation();
  const { hours, minutes, seconds } = useCountdown(countdown, tripId);

  return (
    <View style={styles.waitingContainer}>
      <Text style={styles.countdownText} variant="headlineMedium">
        {hours}h {minutes}m {seconds}s
      </Text>
      <Text>{dayjs(countdown).format('HH:mm:ss')}</Text>
      <Text style={styles.messageText}>{t(message)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  waitingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99_999,
  },
  countdownText: {
    marginBottom: 8,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  messageText: {
    textAlign: 'center',
    color: Colors.ACCENT,
    marginBottom: 16,
  },
});
