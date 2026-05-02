import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    gap: 4,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    marginBottom: 8,
    width: 88,
  },
  avatarText: {
    color: Colors.BACKGROUND,
    fontFamily: Fonts.bold,
    fontSize: 32,
  },
  fullName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  emailSubtitle: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  sectionLabel: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    gap: 10,
    paddingVertical: 12,
  },
  radioLabel: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  input: {
    backgroundColor: Colors.BACKGROUND,
  },
  helperText: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: 4,
  },
  errorText: {
    color: Colors.DESTRUCTIVE,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  divider: {
    marginVertical: 4,
  },
  dangerCard: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    elevation: 1,
  },
  logoutButton: {
    borderColor: Colors.DESTRUCTIVE,
  },
  guestCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  guestCardContent: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  guestIconWrap: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}18`,
    borderRadius: 40,
    height: 72,
    justifyContent: 'center',
    marginBottom: 8,
    width: 72,
  },
  guestTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  guestMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestButtons: {
    gap: 8,
    width: '100%',
  },
  guestBtn: {
    width: '100%',
  },
  bottomPad: {
    height: 32,
  },
  // Skeleton
  skeletonContainer: {
    marginBottom: 24,
  },
  skeletonTitle: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 24,
    marginBottom: 16,
    width: '40%',
  },
  skeletonText: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 16,
    marginBottom: 12,
    width: '100%',
  },
});

export default styles;
