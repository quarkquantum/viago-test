import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    borderWidth: 2,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.9,
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.TEXT,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: FontSizes.xl,
  },
  description: {
    color: Colors.TEXT,
    opacity: 0.7,
    textAlign: 'center',
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
  },
});
