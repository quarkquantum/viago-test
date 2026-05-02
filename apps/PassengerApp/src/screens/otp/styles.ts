import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  container: {
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  email: {
    fontFamily: Fonts.semiBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  expiration: {
    color: Colors.TEXT,
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'center',
  },

  focusStick: {
    backgroundColor: Colors.PRIMARY,
  },
  otpContainer: {
    marginBottom: 32,
  },
  pinCodeBox: {
    backgroundColor: Colors.DESTRUCTIVE,
    borderColor: Colors.ACCENT,
    borderRadius: 12,
    borderWidth: 2,
    height: 56,
    width: 50,
  },
  pinCodeBoxFilled: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderColor: Colors.ACCENT,
  },
  pinCodeBoxFocused: {
    borderColor: Colors.ACCENT, // Will be overridden by focusColor prop
    backgroundColor: Colors.DESTRUCTIVE,
  },
  pinCodeText: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 24,
  },
  placeholderText: {
    color: Colors.TEXT,
  },

  resend: {
    alignSelf: 'center',
  },
  subtitle: {
    color: Colors.ACCENT,
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
});
