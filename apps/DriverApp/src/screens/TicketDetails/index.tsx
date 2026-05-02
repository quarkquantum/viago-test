import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors, TicketStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Bus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useGetTicket } from '@/features/tickets/api/use-get-ticket';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import styles from './styles';

type TicketDetailsRouteProp = RouteProp<RootStackParamList, 'TicketDetails'>;

const STATUS_COLORS: Partial<Record<TicketStatus, { bg: string; text: string }>> = {
  [TicketStatus.ISSUED]: { bg: '#E8F5E9', text: '#2E7D32' },
  [TicketStatus.CANCELLED]: { bg: '#FFEBEE', text: '#C62828' },
  [TicketStatus.EXPIRED]: { bg: '#FFF3E0', text: '#E65100' },
};

const getStatusColor = (status: TicketStatus) => STATUS_COLORS[status] ?? { bg: Colors.CARD, text: Colors.TEXT };

export const TicketDetailsScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<TicketDetailsRouteProp>();
  const { ticketId } = route.params;
  const { data: ticket, isLoading } = useGetTicket(ticketId);

  return (
    <Screen back title={t('screens.tickets.details')}>
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.PRIMARY} size="large" />
        </View>
      ) : ticket ? (
        <Card style={styles.card}>
          <Card.Content>
            {/* Header: Agency & Status */}
            <View style={styles.cardHeader}>
              <View style={styles.agencyInfo}>
                <Bus color={Colors.ACCENT} size={18} />
                <View>
                  <Text style={styles.agencyName}>{ticket.seat.bus.agency.name}</Text>
                  <Text style={styles.licensePlate}>{ticket.seat.bus.licensePlate}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status as TicketStatus).bg }]}>
                <Text style={[styles.statusText, { color: getStatusColor(ticket.status as TicketStatus).text }]}>
                  {t(`tickets.status.${ticket.status.toLowerCase()}`)}
                </Text>
              </View>
            </View>

            {/* Trip Info */}
            <View style={styles.tripRow}>
              <View style={styles.stationContainer}>
                <Text style={styles.timeText}>{dayjs(ticket.booking.fromStation.departureTime).format('HH:mm')}</Text>
                <Text numberOfLines={1} style={styles.stationName}>
                  {ticket.booking.fromStation.name}
                </Text>
              </View>
              <View style={styles.durationContainer}>
                <Bus color={Colors.SECONDARY} size={24} />
              </View>
              <View style={[styles.stationContainer, styles.alignRight]}>
                <Text style={styles.timeText}>{dayjs(ticket.booking.toStation.departureTime).format('HH:mm')}</Text>
                <Text numberOfLines={1} style={styles.stationName}>
                  {ticket.booking.toStation.name}
                </Text>
              </View>
            </View>

            {/* Seat & Date Info */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('tickets.seat')}</Text>
                <Text style={styles.detailValue}>{ticket.seat.number}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('tickets.date')}</Text>
                <Text style={styles.detailValue}>
                  {dayjs(ticket.booking.fromStation.departureTime).format('DD MMM YYYY')}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('tickets.price')}</Text>
                <Text style={styles.detailValue}>{ticket.booking.total} XHF</Text>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode size={180} value={ticket.id} />
              <Text style={styles.qrLabel}>{t('screens.ticketDetails.scanToValidate')}</Text>
            </View>

            <Button mode="contained">{t('tickets.refund')}</Button>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.loader}>
          <Text>{t('screens.ticketDetails.notFound')}</Text>
        </View>
      )}
    </Screen>
  );
};
