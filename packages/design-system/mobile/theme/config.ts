import { Colors } from '@repo/shared';
import { configureFonts, MD3LightTheme } from 'react-native-paper';
import { Fonts } from '../utils/fonts';

// Define the MD3 font scale manually (same structure Paper uses internally)
const fontConfig = {
  bodyLarge: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Fonts.light,
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  displayLarge: {
    fontFamily: Fonts.bold,
    fontSize: 57,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Fonts.medium,
    fontSize: 45,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Fonts.medium,
    fontSize: 36,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Fonts.medium,
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  labelLarge: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  titleLarge: {
    fontFamily: Fonts.medium,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
} as const;

// Build the theme
export const config = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.PRIMARY,
    secondary: Colors.ACCENT,
  },
  fonts: configureFonts({ config: fontConfig }),
};
