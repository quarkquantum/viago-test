import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@repo/shared/constants';
import { BusSeatPolicy } from '@repo/shared/constants/bus';
import { Armchair, ArrowRight, Bus, ChevronRight, CreditCard, MapPin } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

import { Screen } from '@/components/screen';
import { useAuth } from '@/contexts/auth-context';
import { useNetwork } from '@/contexts/network-context';
import { useCreateBooking } from '@/features/booking/api';
import type { RootNav, RootStackParamList } from '@/navigation/root-navigator';
import type { SeatPickerController } from './components/seat-picker-bottom-sheet';
import { SeatPickerBottomSheet } from './components/seat-picker-bottom-sheet';
import { styles } from './styles';

export const ReservationScreen = () => {
  const navigation = useNavigation<RootNav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Reservation'>>();

  const {
    tripId,
    fromStationId,
    toStationId,
    price,
    fromStationName,
    toStationName,
    seatReservationType,
    busSeats,
    selectedSeatId: initialSelectedSeatId,
  } = route.params;

  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOffline } = useNetwork();
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(initialSelectedSeatId ?? null);

  const seatSheetRef = useRef<SeatPickerController>(null);

  const requiresSeatSelection = seatReservationType === BusSeatPolicy.NUMBERED;
  const canProceed = !requiresSeatSelection || Boolean(selectedSeatId);
  const selectedSeatNumber = selectedSeatId ? busSeats.findIndex((s) => s.id === selectedSeatId) + 1 : undefined;

  const openSeatPicker = () => seatSheetRef.current?.open();

  const handleSeatSelected = (seatId: string | null) => {
    setSelectedSeatId(seatId);
    seatSheetRef.current?.close();
  };

  const createBookingMutation = useCreateBooking();

  const handleBookTrip = useCallback(async () => {
    if (!user) {
      Alert.alert(t('reservation.authRequired'), t('reservation.authRequiredMessage'), [
        { style: 'cancel', text: t('common.cancel') },
        { onPress: () => navigation.navigate('Login'), text: t('screens.settings.goToLogin') },
      ]);
      return;
    }

    if (requiresSeatSelection && !selectedSeatId) {
      Alert.alert(t('reservation.seatRequired'), t('reservation.seatRequiredMessage'));
      return;
    }

    try {
      setIsBooking(true);
      const bookingData: { fromStationId: string; toStationId: string; tripId: string; seatId?: string } = {
        fromStationId,
        toStationId,
        tripId,
      };
      if (selectedSeatId) {
        bookingData.seatId = selectedSeatId;
      }

      const result = await createBookingMutation.mutateAsync(bookingData);
      if ('queued' in result && result.queued) {
        toast.success(t('reservation.offlineQueued'));
        return;
      }

      const onlineResult = result as { data?: { id?: string } };
      if (onlineResult.data?.id) {
        navigation.navigate('Payment', { bookingId: onlineResult.data.id });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('reservation.bookingFailed');
      Alert.alert(t('reservation.error'), message);
    } finally {
      setIsBooking(false);
    }
  }, [
    user,
    tripId,
    fromStationId,
    toStationId,
    selectedSeatId,
    requiresSeatSelection,
    createBookingMutation,
    navigation,
    t,
  ]);

  return (
    <>
      <Screen back contentContainerStyle={styles.contentContainer} title={t('reservation.title')}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Bus color={Colors.PRIMARY} size={36} />
            </View>
            <Text style={styles.title}>{t('reservation.title')}</Text>
            <Text style={styles.subtitle}>{t('reservation.subtitle')}</Text>
          </View>

          {/* Route */}
          <View style={styles.card}>
            <View style={styles.routeRow}>
              <View style={styles.station}>
                <MapPin color={Colors.PRIMARY} size={22} />
                <View>
                  <Text style={styles.label}>{t('common.from')}</Text>
                  <Text style={styles.stationName}>{fromStationName}</Text>
                </View>
              </View>
              <ArrowRight color={Colors.ACCENT} size={28} />
              <View style={styles.station}>
                <MapPin color={Colors.DESTRUCTIVE} size={22} />
                <View>
                  <Text style={styles.label}>{t('common.to')}</Text>
                  <Text style={styles.stationName}>{toStationName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Seat selection */}
          {requiresSeatSelection ? (
            <TouchableOpacity onPress={openSeatPicker} style={styles.card}>
              <View style={styles.row}>
                <Armchair color={selectedSeatId ? Colors.PRIMARY : Colors.SECONDARY} size={26} />
                <View style={styles.seatInfo}>
                  <Text style={styles.cardLabel}>{t('reservation.yourSeat')}</Text>
                  <Text style={[styles.seatText, selectedSeatId ? styles.seatSelected : undefined]}>
                    {selectedSeatNumber
                      ? t('seatPicker.seatSelected', { number: selectedSeatNumber })
                      : t('reservation.tapToSelectSeat')}
                  </Text>
                </View>
                <ChevronRight color={Colors.SECONDARY} size={24} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, styles.infoCard]}>
              <Armchair color={Colors.PRIMARY} size={32} />
              <Text style={styles.infoText}>{t('reservation.autoSeatAssignment')}</Text>
            </View>
          )}

          {/* Price */}
          <View style={[styles.card, styles.priceCard]}>
            <Text style={styles.priceLabel}>{t('reservation.totalPrice')}</Text>
            <Text style={styles.priceValue}>{price.toLocaleString()} FCFA</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              disabled={isBooking || !canProceed}
              onPress={handleBookTrip}
              style={[styles.bookButton, (!canProceed || isBooking) && styles.disabled]}
            >
              {isBooking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <CreditCard color="#fff" size={24} />
                  <Text style={styles.bookButtonText}>
                    {requiresSeatSelection && !selectedSeatId
                      ? t('reservation.selectSeatFirst')
                      : isOffline
                        ? t('reservation.reserveOffline')
                        : t('reservation.proceedToPayment')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>

      {/* Bottom sheet renders outside Screen so it overlays the full screen */}
      {requiresSeatSelection && (
        <SeatPickerBottomSheet
          busSeats={busSeats}
          controllerRef={seatSheetRef}
          initialSelectedSeatId={selectedSeatId}
          onSeatSelected={handleSeatSelected}
        />
      )}
    </>
  );
};
