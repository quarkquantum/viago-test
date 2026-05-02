import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    backgroundColor: Colors.BACKGROUND,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
  },
  searchBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeFiltersContainer: {
    marginBottom: 12,
    backgroundColor: `${Colors.ACCENT_FOREGROUND}40`,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeFiltersLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.ACCENT,
  },
  clearAllText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.PRIMARY,
    textDecorationLine: 'underline',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.PRIMARY}15`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.PRIMARY,
  },

  quickFilters: {
    marginBottom: 16,
  },
  quickFiltersLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  quickChipActive: {
    backgroundColor: Colors.PRIMARY,
  },
  quickChipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  quickChipTextActive: {
    color: Colors.BACKGROUND,
  },

  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  clearBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.BACKGROUND,
  },
  listFooter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
