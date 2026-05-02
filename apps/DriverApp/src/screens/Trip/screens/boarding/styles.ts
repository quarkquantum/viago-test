import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
