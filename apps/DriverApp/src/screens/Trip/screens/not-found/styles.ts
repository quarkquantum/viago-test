import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorBadge: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 100,
    backgroundColor: `${Colors.WARNING}15`,
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.TEXT,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: FontSizes['2xl'],
  },
  description: {
    color: Colors.TEXT,
    opacity: 0.65,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    marginBottom: 28,
    maxWidth: '85%',
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
});
