export const Fonts = {
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
  medium: 'Poppins-Medium',
  regular: 'Poppins-Regular',
  semiBold: 'Poppins-SemiBold',
} as const;
export type Fonts = (typeof Fonts)[keyof typeof Fonts];

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
} as const;
export type FontSizes = (typeof FontSizes)[keyof typeof FontSizes];
