import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  guestButton: {
    width: '100%',
  },
  guestContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 60,
  },
  guestMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
});
