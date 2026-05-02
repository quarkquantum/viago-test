import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BusSeatStatus, BusSeatType, Colors } from '@repo/shared/constants';
import { Check, X } from 'lucide-react-native';
import { useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { renderBackdrop } from '@/components/bottom-sheet/backdrop';

// Exposed controller API
export type SeatPickerController = {
  open: () => void;
  close: () => void;
};

type Props = {
  busSeats: any[];
  initialSelectedSeatId: string | null;
  onSeatSelected: (seatId: string | null) => void;
  onClose?: () => void;

  // New prop instead of forwardRef
  controllerRef?: React.Ref<SeatPickerController>;
};

export function SeatPickerBottomSheet({
  busSeats,
  initialSelectedSeatId,
  onSeatSelected,
  onClose,
  controllerRef,
}: Props) {
  const { t } = useTranslation();
  const [selectedSeatId, setSelectedSeatId] = useState(initialSelectedSeatId);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // Expose controlled methods to parent
  useImperativeHandle(
    controllerRef,
    () => ({
      close() {
        bottomSheetRef.current?.close();
      },
      open() {
        bottomSheetRef.current?.expand();
      },
    }),
    []
  );

  const snapPoints = useMemo(() => ['95%'], []);

  const { rows, seatPositionMap } = useMemo(() => {
    const maxPlaces = busSeats.length;
    const rowCount = Math.ceil(maxPlaces / 4);

    const result: { left: any[]; right: any[] }[] = [];
    const sortedSeats = [...busSeats].sort((a, b) => a.id.localeCompare(b.id));
    const leftSideCount = rowCount * 2;

    for (let row = 0; row < rowCount; row++) {
      const leftSeats = [sortedSeats[row * 2] || undefined, sortedSeats[row * 2 + 1] || undefined];
      const rightSeats = [
        sortedSeats[leftSideCount + row * 2] || undefined,
        sortedSeats[leftSideCount + row * 2 + 1] || undefined,
      ];
      result.push({ left: leftSeats, right: rightSeats });
    }

    const seatPosMap = new Map<string, number>();
    sortedSeats.forEach((seat, i) => seatPosMap.set(seat.id, i + 1));

    return { rows: result, seatPositionMap: seatPosMap };
  }, [busSeats]);

  const getSeatStyle = (seat: any, _seatNum: number) => {
    if (!seat) {
      return [styles.seat, styles.seatEmpty];
    }
    if (seat.type === BusSeatType.RIDER) {
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

  const canSelectSeat = (seat: any, _num: number) => {
    if (!seat) {
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

  const handleSeatPress = (seat: any) => {
    if (!canSelectSeat(seat, seatPositionMap.get(seat.id) || 0)) {
      return;
    }
    setSelectedSeatId(seat.id === selectedSeatId ? undefined : seat.id);
  };

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      index={-1}
      onClose={onClose}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('seatPicker.title')}</Text>
        <TouchableOpacity onPress={() => onSeatSelected(selectedSeatId)}>
          <X color={Colors.SECONDARY} size={24} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.busContainer}>
          <View style={styles.seatsGrid}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.left.map((seat, i) => {
                  const num = seat ? seatPositionMap.get(seat.id)! : 0;
                  return (
                    <TouchableOpacity
                      disabled={!canSelectSeat(seat, num)}
                      key={`l-${i}`}
                      onPress={() => seat && handleSeatPress(seat)}
                      style={getSeatStyle(seat, num)}
                    >
                      <Text style={styles.seatNumber}>{seat ? num : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={styles.aisle} />
                {row.right.map((seat, i) => {
                  const num = seat ? seatPositionMap.get(seat.id) : 0;
                  return (
                    <TouchableOpacity
                      disabled={!canSelectSeat(seat, num)}
                      key={`r-${i}`}
                      onPress={() => (seat ? handleSeatPress(seat) : undefined)}
                      style={getSeatStyle(seat, num)}
                    >
                      <Text style={styles.seatNumber}>{seat ? num : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </BottomSheetScrollView>

      <View style={styles.footer}>
        {selectedSeatId ? (
          <Text style={styles.selectedText}>
            {t('seatPicker.seatSelected', {
              number: seatPositionMap.get(selectedSeatId),
            })}
          </Text>
        ) : undefined}

        <TouchableOpacity
          disabled={!selectedSeatId}
          onPress={() => onSeatSelected(selectedSeatId)}
          style={[styles.confirmBtn, !selectedSeatId && styles.confirmBtnDisabled]}
        >
          <Check color="#fff" size={22} />
          <Text style={styles.confirmText}>{t('seatPicker.confirm')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  aisle: { width: 40 },
  busContainer: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderColor: Colors.ACCENT,
    borderRadius: 24,
    borderWidth: 4,
    padding: 16,
  },
  confirmBtn: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: {
    paddingHorizontal: 20,
  },
  driverArea: {
    /* Same as before */
  },
  driverLabel: {
    /* Same */
  },
  footer: {
    backgroundColor: Colors.BACKGROUND,
    borderTopColor: Colors.CARD,
    borderTopWidth: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seat: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  seatAvailable: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  seatEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  seatNumber: { color: '#fff', fontSize: 15, fontWeight: '700' },
  seatOccupied: { backgroundColor: Colors.SECONDARY, borderColor: Colors.SECONDARY },
  seatReserved: { backgroundColor: Colors.DESTRUCTIVE, borderColor: Colors.DESTRUCTIVE },
  seatSelected: { backgroundColor: Colors.WARNING, borderColor: Colors.ACCENT, borderWidth: 4 },
  seatsGrid: { gap: 12 },
  selectedText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  steeringWheel: {
    /* Same */
  },
  title: {
    color: Colors.TEXT,
    fontSize: 20,
    fontWeight: '700',
  },
});
