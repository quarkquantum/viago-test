import { Colors } from '@repo/shared/constants';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  aisle: {
    width: 30,
  },
  bottomAction: {
    backgroundColor: Colors.BACKGROUND,
    borderTopColor: Colors.CARD,
    borderTopWidth: 1,
    padding: 20,
  },
  busContainer: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderColor: Colors.ACCENT,
    borderRadius: 24,
    borderWidth: 4,
    padding: 16,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.BACKGROUND,
    fontSize: 18,
    fontWeight: '700',
  },
  driverArea: {
    alignItems: 'center',
    borderBottomColor: Colors.CARD,
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  driverLabel: {
    color: Colors.SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  seat: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
    fontSize: 14,
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
  seatsGrid: {
    gap: 10,
  },
  selectPrompt: {
    color: Colors.SECONDARY,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedInfo: {
    alignItems: 'center',
    backgroundColor: Colors.WARNING,
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
  },
  selectedText: {
    color: Colors.ACCENT,
    fontSize: 16,
    fontWeight: '600',
  },
  steeringWheel: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.ACCENT,
    borderRadius: 20,
    borderWidth: 4,
    height: 40,
    width: 40,
  },
});
