export const Colors = {
  ACCENT: '#0A2F5C',
  ACCENT_FOREGROUND: '#EBEBEB',
  BACKGROUND: '#FFF',
  CARD: '#ECEFF1',
  DESTRUCTIVE: '#D32F2F',
  PRIMARY: '#4CAF50',
  SECONDARY: '#1976D2',
  TEXT: '#212121',
  SUCCESS: '#4CAF50',
  WARNING: '#FFA726',
  BLACK: '#000',
  WHITE: '#fff',
} as const;
export type Colors = (typeof Colors)[keyof typeof Colors];
