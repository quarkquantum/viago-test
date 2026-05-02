import { Colors } from '@repo/shared/constants';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 16,
    width: 72,
  },
  title: {
    color: Colors.TEXT,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.SECONDARY,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 6,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  station: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  label: {
    color: Colors.SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  stationName: {
    color: Colors.TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardLabel: {
    color: Colors.SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  seatText: {
    color: Colors.SECONDARY,
    fontSize: 17,
    marginTop: 6,
  },
  seatSelected: {
    color: Colors.PRIMARY,
    fontSize: 19,
    fontWeight: '700',
  },
  infoCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  infoText: {
    color: Colors.SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  priceCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: Colors.TEXT,
    fontSize: 17,
    fontWeight: '600',
  },
  priceValue: {
    color: Colors.PRIMARY,
    fontSize: 32,
    fontWeight: '900',
  },
  actions: {
    marginTop: 8,
  },
  bookButton: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 18,
    elevation: 10,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelText: {
    color: Colors.SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
