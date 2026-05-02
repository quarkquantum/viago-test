import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { BusSeatPolicy, BusSeatStatus, BusSeatType, Colors } from '@repo/shared/constants';
import { Check, User, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import type { RootStackParamList } from '@/navigation/root-navigator';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

type Seat = {
  id: string;
  status: string;
  type: string;
};

// Reserved positions: seat 1 = driver, seat 2 = cashier
const RESERVED_POSITIONS = [1, 2];

export const SeatSelectionScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { busSeats, tripId, fromStationId, toStationId, price, fromStationName, toStationName } = route.params;

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  // Create a grid layout with SIDE-BASED ordering
  // Layout: 1 2 | 5 6
  //         3 4 | 7 8
  // Left side fills first (1,2,3,4), then right side (5,6,7,8)
  const { rows, seatPositionMap } = useMemo(() => {
    const maxPlaces = busSeats.length;
    const rowCount = Math.ceil(maxPlaces / 4); // 4 seats per row
    const result: { left: (Seat | null)[]; right: (Seat | null)[] }[] = [];

    const sortedSeats = [...busSeats].sort((a, b) => a.id.localeCompare(b.id));

    // Left side gets first (rowCount * 2) seats, right side gets the rest
    const leftSideCount = rowCount * 2;

    // Build rows - left side first, then right
    for (let row = 0; row < rowCount; row++) {
      const leftIdx1 = row * 2;
      const leftIdx2 = row * 2 + 1;
      const leftSeats: (Seat | null)[] = [
        leftIdx1 < sortedSeats.length ? sortedSeats[leftIdx1]! : null,
        leftIdx2 < sortedSeats.length ? sortedSeats[leftIdx2]! : null,
      ];

      const rightIdx1 = leftSideCount + row * 2;
      const rightIdx2 = leftSideCount + row * 2 + 1;
      const rightSeats: (Seat | null)[] = [
        rightIdx1 < sortedSeats.length ? sortedSeats[rightIdx1]! : null,
        rightIdx2 < sortedSeats.length ? sortedSeats[rightIdx2]! : null,
      ];

      result.push({ left: leftSeats, right: rightSeats });
    }

    const seatPosMap = new Map<string, number>();
    sortedSeats.forEach((seat, index) => {
      seatPosMap.set(seat.id, index + 1);
    });

    return { rows: result, seatPositionMap: seatPosMap };
  }, [busSeats]);

  const getSeatStyle = (seat: Seat | null, globalIndex: number) => {
    if (!seat) {
      return [styles.seat, styles.seatEmpty];
    }
    if (RESERVED_POSITIONS.includes(globalIndex + 1) || seat.type === BusSeatType.RIDER) {
      return [styles.seat, styles.seatReserved];
    }
    if (seat.status === BusSeatStatus.OCCUPIED) {
      return [styles.seat, styles.seatOccupied];
    }
    if (seat.id === selectedSeatId) {
      return [styles.seat, styles.seatSelected];
    }
    return [styles.seat, styles.seatAvailable];
  };

  const canSelectSeat = (seat: Seat | null, globalIndex: number) => {
    if (!seat) {
      return false;
    }
    if (RESERVED_POSITIONS.includes(globalIndex + 1)) {
      return false;
    }
    if (seat.type === BusSeatType.RIDER) {
      return false;
    }
    if (seat.status === BusSeatStatus.OCCUPIED) {
      return false;
    }
    return true;
  };

  const handleSeatPress = (seat: Seat | null, globalIndex: number) => {
    if (!canSelectSeat(seat, globalIndex)) {
      return;
    }
    setSelectedSeatId(seat?.id === selectedSeatId ? null : (seat?.id ?? null));
  };

  const handleConfirm = useCallback(() => {
    if (!selectedSeatId) {
      return;
    }

    navigation.navigate('Reservation', {
      busId: route.params.busId,
      busSeats,
      fromStationId,
      fromStationName,
      price,
      seatReservationType: BusSeatPolicy.NUMBERED,
      selectedSeatId,
      toStationId,
      toStationName,
      tripId,
    });
  }, [
    selectedSeatId,
    tripId,
    fromStationId,
    toStationId,
    price,
    fromStationName,
    toStationName,
    busSeats,
    navigation,
    route.params.busId,
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Screen back title={t('seatPicker.title')}>
        <View style={styles.busContainer}>
          {/* Driver area */}
          <View style={styles.driverArea}>
            <View style={styles.steeringWheel} />
            <Text style={styles.driverLabel}>{t('seatPicker.driver')}</Text>
          </View>

          {/* Seats grid */}
          <View style={styles.seatsGrid}>
            {rows.map((row, rowIndex) => {
              const rowSeats: React.ReactNode[] = [];

              row.left.forEach((seat, colIndex) => {
                const seatNum = seat ? seatPositionMap.get(seat.id) || 0 : 0;

                rowSeats.push(
                  <TouchableOpacity
                    disabled={!canSelectSeat(seat, seatNum)}
                    key={`left-${rowIndex}-${colIndex}`}
                    onPress={() => handleSeatPress(seat, seatNum)}
                    style={getSeatStyle(seat, seatNum)}
                  >
                    {seat &&
                      (RESERVED_POSITIONS.includes(seatNum) || seat.type === BusSeatType.RIDER ? (
                        <X color={Colors.BACKGROUND} size={16} />
                      ) : seat.status === BusSeatStatus.OCCUPIED ? (
                        <User color={Colors.BACKGROUND} size={16} />
                      ) : (
                        <Text style={styles.seatNumber}>{seatNum}</Text>
                      ))}
                  </TouchableOpacity>
                );
              });

              rowSeats.push(<View key={`aisle-${rowIndex}`} style={styles.aisle} />);

              row.right.forEach((seat, colIndex) => {
                const seatNum = seat ? seatPositionMap.get(seat.id) || 0 : 0;

                rowSeats.push(
                  <TouchableOpacity
                    disabled={!canSelectSeat(seat, seatNum)}
                    key={`right-${rowIndex}-${colIndex}`}
                    onPress={() => handleSeatPress(seat, seatNum)}
                    style={getSeatStyle(seat, seatNum)}
                  >
                    {seat &&
                      (RESERVED_POSITIONS.includes(seatNum) || seat.type === BusSeatType.RIDER ? (
                        <X color={Colors.BACKGROUND} size={16} />
                      ) : seat.status === BusSeatStatus.OCCUPIED ? (
                        <User color={Colors.BACKGROUND} size={16} />
                      ) : (
                        <Text style={styles.seatNumber}>{seatNum}</Text>
                      ))}
                  </TouchableOpacity>
                );
              });

              return (
                <View key={rowIndex} style={styles.row}>
                  {rowSeats}
                </View>
              );
            })}
          </View>
        </View>
      </Screen>

      {/* Sticky bottom action — outside Screen so it stays fixed */}
      <View style={styles.bottomAction}>
        {selectedSeatId ? (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedText}>
              {t('seatPicker.seatSelected', {
                number: seatPositionMap.get(selectedSeatId) || 0,
              })}
            </Text>
          </View>
        ) : (
          <Text style={styles.selectPrompt}>{t('seatPicker.selectPrompt')}</Text>
        )}

        <TouchableOpacity
          disabled={!selectedSeatId}
          onPress={handleConfirm}
          style={[styles.confirmButton, !selectedSeatId && styles.confirmButtonDisabled]}
        >
          <Check color={Colors.BACKGROUND} size={22} />
          <Text style={styles.confirmButtonText}>{t('seatPicker.confirm')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
