import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { Building2, Bus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';

type Props = {
  trip: Trip;
};

const formatDate = (dateStr: string) => dayjs(dateStr).format('ddd, DD MMM YYYY');

export const InfoSection = ({ trip }: Props) => {
  const { t } = useTranslation();

  return (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <View style={styles.infoIconContainer}>
          <Bus color={Colors.PRIMARY} size={18} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoTitle}>{trip.bus.title}</Text>
          <Text style={styles.infoSubtitle}>{trip.bus.licensePlate}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={[styles.infoIconContainer, styles.infoIconContainerSecondary]}>
          <Building2 color={Colors.SECONDARY} size={18} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoTitle}>{trip.agency.name}</Text>
          <Text style={styles.infoSubtitle}>
            {t('trips.details.departure')}: {formatDate(trip.departureTime)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconContainerSecondary: {
    backgroundColor: `${Colors.SECONDARY}15`,
  },
  infoDetails: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.ACCENT,
  },
  infoSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.SECONDARY,
  },
});
