import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 12,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  cardHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.ACCENT_FOREGROUND,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
  },
  agencyInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 6,
    marginRight: 8,
  },
  agencyName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  licensePlate: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 12,
  },

  statusBadge: {
    alignItems: 'center',
    borderRadius: 100,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  tripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  stationBlock: {
    flex: 1,
  },
  stationBlockRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  dateSmall: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 11,
    marginBottom: 4,
    marginTop: 1,
  },
  stationName: {
    color: Colors.TEXT,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  stationNameRight: {
    textAlign: 'right',
  },

  connector: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    width: 90,
  },
  connectorLine: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    flex: 1,
    height: 1.5,
  },
  connectorIcon: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}15`,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginHorizontal: 6,
    width: 28,
  },

  footer: {
    alignItems: 'center',
    borderTopColor: Colors.ACCENT_FOREGROUND,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  dateInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dateText: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  priceText: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
});

export default styles;
