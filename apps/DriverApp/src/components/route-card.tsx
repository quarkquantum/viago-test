import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Bus, Users } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

dayjs.extend(duration);

type Props = {
  route: any;
  onPress?: () => void;
};

export const RouteCard = ({ route, onPress }: Props) => {
  const formatTime = (t: string) => dayjs(t).format('HH:mm');
  const isSoldOut = route.seats.available === 0;

  return (
    <TouchableOpacity disabled={isSoldOut} onPress={onPress} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.busInfo}>
          <Bus color={Colors.SECONDARY} size={18} />
          <Text style={styles.busNumber}>{route.bus.licensePlate || route.bus.id.slice(-7).toUpperCase()}</Text>
        </View>
        <Text style={styles.agency}>{route.agency.name}</Text>
      </View>

      {/* Route Timeline */}
      <View style={styles.routeRow}>
        <View style={styles.timeCol}>
          <Text style={styles.time}>{formatTime(route.from.departureTime)}</Text>
          <Text style={styles.station}>{route.from.name}</Text>
        </View>

        <View style={styles.connector}>
          <View style={styles.dashLine} />
          <View style={styles.busIconWrapper}>
            <Bus color={Colors.ACCENT} size={22} />
          </View>
          <View style={styles.dashLine} />
        </View>

        <View style={styles.timeCol}>
          <Text style={styles.time}>{formatTime(route.to.departureTime)}</Text>
          <Text style={styles.station}>{route.to.name}</Text>
        </View>
      </View>

      {/* Details + CTA */}
      <View style={styles.footer}>
        <View style={styles.details}>
          {/* Duration */}
          {/* <View style={styles.detailItem}>
            <Clock size={15} color={Colors.ACCENT} />
            <Text style={styles.detailText}>
              {dayjs.duration(route.duration.totalMinutes, 'minutes').format('H[h] m[m]')}
            </Text>
          </View> */}

          {/* Seats */}
          <View style={styles.detailItem}>
            <Users size={15} />
            <Text style={styles.detailText}>
              {route.seats.available}/{route.seats.total}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.detailItem}>
            <Text style={styles.price}>{route.price.toLocaleString()} FCFA</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  agency: {
    color: Colors.SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  busIconWrapper: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 6,
  },
  busInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  busNumber: {
    color: Colors.ACCENT,
    fontSize: 15.5,
    fontWeight: '700',
  },
  button: {
    borderRadius: 14,
    minWidth: 120,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    height: 48,
    paddingHorizontal: 12,
  },
  buttonLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  connector: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dashLine: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderStyle: 'dashed',
    flex: 1,
    height: 1.5,
    maxWidth: 50,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  detailText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Gap: 18,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  price: {
    color: Colors.PRIMARY,
    fontSize: 17,
    fontWeight: '800',
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  station: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  time: {
    color: Colors.ACCENT,
    fontSize: 19,
    fontWeight: '800',
  },
  timeCol: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
});
