import { useNavigation } from '@react-navigation/native';
import { Colors, TicketStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Bus, Calendar, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import type { Route as Ticket } from '@/features/me/api/use-list-my-tickets';
import type { RootNav } from '@/navigation/root-navigator';
import styles from './styles';

type TicketCardProps = {
  item: Ticket;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  [TicketStatus.ISSUED]: { bg: '#E8F5E9', text: '#2E7D32' },
  [TicketStatus.CANCELLED]: { bg: '#FFEBEE', text: '#C62828' },
  [TicketStatus.EXPIRED]: { bg: '#FFF3E0', text: '#E65100' },
};

export const TicketCard = ({ item }: TicketCardProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  const statusColors = STATUS_COLORS[item.status] ?? { bg: Colors.CARD, text: Colors.TEXT };

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* ─── Header: Agency + Status badge ─── */}
          <View style={styles.cardHeader}>
            <View style={styles.agencyInfo}>
              <Bus color={Colors.PRIMARY} size={16} />
              <Text numberOfLines={1} style={styles.agencyName}>
                {item.seat.bus.agency.name}
              </Text>
              <Text style={styles.licensePlate}>{item.seat.bus.licensePlate}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {t(`tickets.status.${item.status.toLowerCase()}`)}
              </Text>
            </View>
          </View>

          {/* ─── Trip row: Stations + connector ─── */}
          <View style={styles.tripRow}>
            {/* Departure */}
            <View style={styles.stationBlock}>
              <Text style={styles.timeText}>{dayjs(item.booking.fromStation.departureTime).format('HH:mm')}</Text>
              <Text style={styles.dateSmall}>{dayjs(item.booking.fromStation.departureTime).format('DD MMM')}</Text>
              <Text numberOfLines={1} style={styles.stationName}>
                {item.booking.fromStation.name}
              </Text>
            </View>

            {/* Connector */}
            <View style={styles.connector}>
              <View style={styles.connectorLine} />
              <View style={styles.connectorIcon}>
                <Bus color={Colors.PRIMARY} size={13} />
              </View>
              <View style={styles.connectorLine} />
            </View>

            {/* Arrival */}
            <View style={[styles.stationBlock, styles.stationBlockRight]}>
              <Text style={styles.timeText}>{dayjs(item.booking.toStation.departureTime).format('HH:mm')}</Text>
              <Text style={styles.dateSmall}>{dayjs(item.booking.toStation.departureTime).format('DD MMM')}</Text>
              <Text numberOfLines={1} style={[styles.stationName, styles.stationNameRight]}>
                {item.booking.toStation.name}
              </Text>
            </View>
          </View>

          {/* ─── Footer: Date + Price + Chevron ─── */}
          <View style={styles.footer}>
            <View style={styles.dateInfo}>
              <Calendar color={Colors.SECONDARY} size={13} />
              <Text style={styles.dateText}>{dayjs(item.createdAt).format('ddd, D MMM YYYY')}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{item.booking.total} XHF</Text>
              <ChevronRight color={Colors.PRIMARY} size={16} />
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};
