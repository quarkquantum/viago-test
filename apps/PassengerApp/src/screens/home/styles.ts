import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  greetingContainer: {
    marginTop: 4,
    marginBottom: 20,
  },
  greetingText: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.ACCENT,
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.SECONDARY,
    marginTop: 2,
  },

  searchTrigger: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: `${Colors.ACCENT}08`,
    marginBottom: 28,
  },
  searchTriggerPressed: {
    opacity: 0.85,
  },
  searchIconContainer: {
    marginRight: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.PRIMARY}12`,
  },
  searchTriggerTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  searchTriggerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.ACCENT,
    marginBottom: 2,
  },
  searchTriggerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTriggerSub: {
    fontFamily: Fonts.medium,
    fontSize: 12.5,
    color: Colors.ACCENT,
    opacity: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: `${Colors.ACCENT}35`,
    marginHorizontal: 6,
  },

  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    alignItems: 'center',
    gap: 8,
    width: '30%',
  },
  actionIconArea: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ACCENT,
  },

  ridesSection: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  seeAllText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  ridesList: {
    gap: 16,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.ACCENT,
    marginTop: 4,
  },
  emptyMessage: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.SECONDARY,
    textAlign: 'center',
  },

  sheetBackground: {
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetIndicator: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    width: 48,
    height: 6,
  },
  sheetContent: {
    paddingBottom: 40,
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.ACCENT,
    marginBottom: 24,
  },
  sheetForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.ACCENT,
    marginLeft: 4,
  },
  sheetInput: {
    backgroundColor: Colors.BACKGROUND,
    fontSize: 16,
    height: 56,
  },
  sheetInputOutline: {
    borderRadius: 16,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderWidth: 1.5,
  },
  datePickerContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  submitBtn: {
    marginTop: 32,
    borderRadius: 16,
  },
  submitBtnContent: {
    height: 56,
  },
  submitBtnLabel: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});
