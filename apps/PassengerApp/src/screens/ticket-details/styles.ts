import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  agencyInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  agencyName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.ACCENT_FOREGROUND,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  dateInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dateText: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
    opacity: 0.8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.6,
  },
  detailValue: {
    color: Colors.TEXT,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  detailsRow: {
    borderTopColor: Colors.ACCENT_FOREGROUND,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
  },
  durationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: Colors.ACCENT_FOREGROUND,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
  },
  licensePlate: {
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    fontSize: 12,
    opacity: 0.6,
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  priceText: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginTop: 8,
    padding: 24,
  },
  qrLabel: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginTop: 16,
    opacity: 0.6,
  },
  stationContainer: {
    flex: 1,
  },
  stationName: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
    opacity: 0.8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  timeText: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  tripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
