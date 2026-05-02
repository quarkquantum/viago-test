import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Bus, Calendar, Clock, Info, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { renderBackdrop } from '@/components/bottom-sheet/backdrop';
import type { Route } from '@/features/trips/api/use-list-trips-routes';

dayjs.extend(duration);

type Props = {
  route: Route | null;
  ref: React.RefObject<BottomSheet | null>;
};

export const TripDetailsSheet = ({ route, ref }: Props) => {
  const { t } = useTranslation();

  const isSoldOut = (route?.seats.available ?? 0) === 0;
  const seatColor = isSoldOut
    ? Colors.DESTRUCTIVE
    : (route?.seats.available ?? 0) > 5
      ? Colors.PRIMARY
      : Colors.WARNING;

  const durationMins = route ? dayjs(route.to.departureTime).diff(dayjs(route.from.departureTime), 'minute') : 0;
  const durationLabel =
    durationMins > 0 ? dayjs.duration(durationMins, 'minutes').format(durationMins >= 60 ? 'H[h] m[m]' : 'm[m]') : null;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      index={-1}
      ref={ref}
      snapPoints={['55%', '80%']}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {route && (
          <>
            {/* ─── Agency + Bus ─── */}
            <View style={styles.agencyRow}>
              <View style={styles.agencyIconWrap}>
                <Bus color={Colors.PRIMARY} size={18} />
              </View>
              <View>
                <Text style={styles.agencyName}>{route.agency.name}</Text>
                <Text style={styles.licensePlate}>{route.bus.licensePlate}</Text>
              </View>
            </View>

            {/* ─── Route ─── */}
            <View style={styles.routeCard}>
              {/* Departure */}
              <View style={styles.stationBlock}>
                <Text style={styles.time}>{dayjs(route.from.departureTime).format('HH:mm')}</Text>
                <Text style={styles.date}>{dayjs(route.from.departureTime).format('ddd, D MMM')}</Text>
                <Text numberOfLines={1} style={styles.stationName}>
                  {route.from.name}
                </Text>
              </View>

              {/* Connector */}
              <View style={styles.connector}>
                <View style={styles.connectorLine} />
                <View style={styles.connectorDot} />
                {durationLabel && <Text style={styles.durationLabel}>{durationLabel}</Text>}
                <View style={styles.connectorDot} />
                <View style={styles.connectorLine} />
              </View>

              {/* Arrival */}
              <View style={[styles.stationBlock, styles.stationBlockRight]}>
                <Text style={styles.time}>{dayjs(route.to.departureTime).format('HH:mm')}</Text>
                <Text style={styles.date}>{dayjs(route.to.departureTime).format('ddd, D MMM')}</Text>
                <Text numberOfLines={1} style={[styles.stationName, styles.stationNameRight]}>
                  {route.to.name}
                </Text>
              </View>
            </View>

            {/* ─── Info rows ─── */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar color={Colors.SECONDARY} size={16} />
                </View>
                <Text style={styles.infoLabel}>{t('screens.rides.details.date')}</Text>
                <Text style={styles.infoValue}>{dayjs(route.from.departureTime).format('dddd, D MMMM YYYY')}</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Clock color={Colors.SECONDARY} size={16} />
                </View>
                <Text style={styles.infoLabel}>{t('screens.rides.details.duration')}</Text>
                <Text style={styles.infoValue}>{durationLabel ?? '—'}</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Users color={seatColor} size={16} />
                </View>
                <Text style={styles.infoLabel}>{t('screens.rides.details.seats')}</Text>
                <Text style={[styles.infoValue, { color: seatColor }]}>
                  {isSoldOut
                    ? t('screens.rides.details.soldOut')
                    : `${route.seats.reserved} ${t('screens.rides.details.reserved')} • ${route.seats.available} ${t('screens.rides.details.available')} (${route.seats.total})`}
                </Text>
              </View>
            </View>

            {/* ─── Price ─── */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('screens.rides.details.price')}</Text>
              <Text style={styles.priceValue}>{route.price.toLocaleString()} FCFA</Text>
            </View>

            {/* ─── Info notice ─── */}
            <View style={styles.notice}>
              <Info color={Colors.SECONDARY} size={14} />
              <Text style={styles.noticeText}>{t('screens.rides.details.visitNotice')}</Text>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.BACKGROUND,
  },
  indicator: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ─── Agency ───
  agencyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  agencyIconWrap: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}15`,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  agencyName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  licensePlate: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 1,
  },

  // ─── Route card ───
  routeCard: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}08`,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stationBlock: {
    flex: 1,
    gap: 2,
  },
  stationBlockRight: {
    alignItems: 'flex-end',
  },
  time: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 22,
  },
  date: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  stationName: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  stationNameRight: {
    textAlign: 'right',
  },
  connector: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  connectorLine: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    height: 1.5,
    width: 20,
  },
  connectorDot: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  durationLabel: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.medium,
    fontSize: 11,
    marginVertical: 2,
  },

  // ─── Info rows ───
  infoSection: {
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoIcon: {
    width: 20,
  },
  infoLabel: {
    color: Colors.SECONDARY,
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  separator: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },

  // ─── Price ───
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  priceLabel: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  priceValue: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.bold,
    fontSize: 22,
  },

  // ─── Notice ───
  notice: {
    alignItems: 'flex-start',
    backgroundColor: `${Colors.SECONDARY}10`,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  noticeText: {
    color: Colors.SECONDARY,
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
