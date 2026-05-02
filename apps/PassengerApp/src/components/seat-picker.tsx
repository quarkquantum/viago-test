import { Colors } from '@repo/shared/constants';
import { User, X } from 'lucide-react-native';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Seat = {
  id: string;
  status: string;
  type: string;
};

type Props = {
  seats: Seat[];
  maxPlaces: number;
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string | null) => void;
};

// Reserved positions: seat 1 = driver, seat 2 = cashier
const RESERVED_POSITIONS = [1, 2];

export const SeatPicker = ({ seats, maxPlaces, selectedSeatId, onSeatSelect }: Props) => {
  const { t } = useTranslation();

  // Create a grid layout: 2 columns (left and right), with aisle in middle
  // Standard bus layout: 2 seats | aisle | 2 seats per row
  const rows = useMemo(() => {
    const rowCount = Math.ceil(maxPlaces / 4); // 4 seats per row (2 left, 2 right)
    const result: { left: (Seat | null)[]; right: (Seat | null)[] }[] = [];

    // Sort seats by some order (assuming they're ordered by creation or ID)
    const sortedSeats = seats;

    let seatIndex = 0;
    for (let row = 0; row < rowCount; row++) {
      const leftSeats: (Seat | null)[] = [];
      const rightSeats: (Seat | null)[] = [];

      // Left side (2 seats)
      for (let col = 0; col < 2; col++) {
        if (seatIndex < sortedSeats.length) {
          leftSeats.push(sortedSeats[seatIndex]);
        } else {
          leftSeats.push(undefined);
        }
        seatIndex++;
      }

      // Right side (2 seats)
      for (let col = 0; col < 2; col++) {
        if (seatIndex < sortedSeats.length) {
          rightSeats.push(sortedSeats[seatIndex]);
        } else {
          rightSeats.push(undefined);
        }
        seatIndex++;
      }

      result.push({ left: leftSeats, right: rightSeats });
    }

    return result;
  }, [seats, maxPlaces]);

  const getSeatStyle = (seat: Seat | null, globalIndex: number) => {
    if (!seat) {
      return [styles.seat, styles.seatEmpty];
    }

    // Check if this is a reserved position (driver/cashier)
    if (RESERVED_POSITIONS.includes(globalIndex + 1)) {
      return [styles.seat, styles.seatReserved];
    }

    // Check if rider type (driver/cashier)
    if (seat.type === 'RIDER') {
      return [styles.seat, styles.seatReserved];
    }

    // Check if occupied
    if (seat.status === 'OCCUPIED') {
      return [styles.seat, styles.seatOccupied];
    }

    // Check if selected
    if (seat.id === selectedSeatId) {
      return [styles.seat, styles.seatSelected];
    }

    // Available
    return [styles.seat, styles.seatAvailable];
  };

  const canSelectSeat = (seat: Seat | null, globalIndex: number) => {
    if (!seat) {
      return false;
    }
    if (RESERVED_POSITIONS.includes(globalIndex + 1)) {
      return false;
    }
    if (seat.type === 'RIDER') {
      return false;
    }
    if (seat.status === 'OCCUPIED') {
      return false;
    }
    return true;
  };

  const handleSeatPress = (seat: Seat | null, globalIndex: number) => {
    if (!canSelectSeat(seat, globalIndex)) {
      return;
    }

    if (seat?.id === selectedSeatId) {
      onSeatSelect(undefined); // Deselect
    } else {
      onSeatSelect(seat?.id);
    }
  };

  let globalSeatIndex = 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('seatPicker.title')}</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatAvailable]} />
          <Text style={styles.legendText}>{t('seatPicker.available')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatOccupied]} />
          <Text style={styles.legendText}>{t('seatPicker.occupied')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatSelected]} />
          <Text style={styles.legendText}>{t('seatPicker.selected')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatReserved]} />
          <Text style={styles.legendText}>{t('seatPicker.reserved')}</Text>
        </View>
      </View>

      {/* Bus outline */}
      <View style={styles.busContainer}>
        {/* Driver area */}
        <View style={styles.driverArea}>
          <View style={styles.steeringWheel} />
          <Text style={styles.driverLabel}>{t('seatPicker.driver')}</Text>
        </View>

        {/* Seats grid */}
        <ScrollView
          contentContainerStyle={styles.seatsContent}
          showsVerticalScrollIndicator={false}
          style={styles.seatsContainer}
        >
          {rows.map((row, rowIndex) => {
            const rowSeats: React.ReactNode[] = [];

            // Left seats
            row.left.forEach((seat, colIndex) => {
              const currentIndex = globalSeatIndex;
              globalSeatIndex++;

              rowSeats.push(
                <TouchableOpacity
                  disabled={!canSelectSeat(seat, currentIndex)}
                  key={`left-${rowIndex}-${colIndex}`}
                  onPress={() => handleSeatPress(seat, currentIndex)}
                  style={getSeatStyle(seat, currentIndex)}
                >
                  {seat &&
                    (RESERVED_POSITIONS.includes(currentIndex + 1) || seat.type === 'RIDER' ? (
                      <X color={Colors.BACKGROUND} size={14} />
                    ) : seat.status === 'OCCUPIED' ? (
                      <User color={Colors.BACKGROUND} size={14} />
                    ) : (
                      <Text style={styles.seatNumber}>{currentIndex + 1}</Text>
                    ))}
                </TouchableOpacity>
              );
            });

            // Aisle
            rowSeats.push(<View key={`aisle-${rowIndex}`} style={styles.aisle} />);

            // Right seats
            row.right.forEach((seat, colIndex) => {
              const currentIndex = globalSeatIndex;
              globalSeatIndex++;

              rowSeats.push(
                <TouchableOpacity
                  disabled={!canSelectSeat(seat, currentIndex)}
                  key={`right-${rowIndex}-${colIndex}`}
                  onPress={() => handleSeatPress(seat, currentIndex)}
                  style={getSeatStyle(seat, currentIndex)}
                >
                  {seat &&
                    (RESERVED_POSITIONS.includes(currentIndex + 1) || seat.type === 'RIDER' ? (
                      <X color={Colors.BACKGROUND} size={14} />
                    ) : seat.status === 'OCCUPIED' ? (
                      <User color={Colors.BACKGROUND} size={14} />
                    ) : (
                      <Text style={styles.seatNumber}>{currentIndex + 1}</Text>
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
        </ScrollView>
      </View>

      {/* Selected seat info */}
      {selectedSeatId && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>
            {t('seatPicker.seatSelected', {
              number: seats.findIndex((s) => s.id === selectedSeatId) + 1,
            })}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aisle: {
    width: 24,
  },
  busContainer: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderColor: Colors.ACCENT,
    borderRadius: 20,
    borderWidth: 3,
    padding: 16,
  },
  container: {
    marginBottom: 16,
  },
  driverArea: {
    alignItems: 'center',
    borderBottomColor: Colors.CARD,
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
  },
  driverLabel: {
    color: Colors.SECONDARY,
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendColor: {
    borderRadius: 4,
    height: 20,
    width: 20,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendText: {
    color: Colors.SECONDARY,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
  },
  seat: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  seatAvailable: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  seatEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  seatNumber: {
    color: Colors.BACKGROUND,
    fontSize: 12,
    fontWeight: '700',
  },
  seatOccupied: {
    backgroundColor: Colors.SECONDARY,
    borderColor: Colors.SECONDARY,
  },
  seatReserved: {
    backgroundColor: Colors.DESTRUCTIVE,
    borderColor: Colors.DESTRUCTIVE,
  },
  seatSelected: {
    backgroundColor: Colors.WARNING,
    borderColor: Colors.ACCENT,
    borderWidth: 3,
  },
  seatsContainer: {
    maxHeight: 300,
  },
  seatsContent: {
    paddingVertical: 8,
  },
  selectedInfo: {
    alignItems: 'center',
    backgroundColor: Colors.WARNING,
    borderRadius: 8,
    marginTop: 12,
    padding: 12,
  },
  selectedText: {
    color: Colors.ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  steeringWheel: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.ACCENT,
    borderRadius: 15,
    borderWidth: 3,
    height: 30,
    width: 30,
  },
  title: {
    color: Colors.TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});
