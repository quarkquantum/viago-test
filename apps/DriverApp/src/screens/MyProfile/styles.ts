import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  errorText: {
    color: Colors.DESTRUCTIVE,
    fontSize: 12,
    marginTop: 4,
  },
  formContainer: {
    gap: 16,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  avatar: {
    backgroundColor: Colors.PRIMARY,
    marginBottom: 12,
  },
  avatarText: {
    color: Colors.BACKGROUND,
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  userName: {
    color: Colors.ACCENT,
    fontSize: 20,
    fontFamily: Fonts.semiBold,
  },
  userEmail: {
    color: Colors.SECONDARY,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginTop: 4,
  },
  agencySection: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.CARD,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agencyName: {
    color: Colors.ACCENT,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    marginLeft: 8,
  },
  agencyDescription: {
    color: Colors.TEXT,
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
    opacity: 0.8,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.6,
  },
  joinedText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    marginLeft: 4,
  },
  helperText: {
    color: Colors.TEXT,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.BACKGROUND,
  },
  inputContainer: {
    // No marginBottom - using gap on parent
  },
  inputLabel: {
    color: Colors.TEXT,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  logoutButton: {
    borderColor: Colors.DESTRUCTIVE,
  },
  logoutSection: {
    marginTop: 24,
  },
  notLoggedInCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    marginBottom: 16,
  },
  notLoggedInText: {
    color: Colors.TEXT,
    marginBottom: 16,
  },
  notLoggedInTitle: {
    color: Colors.ACCENT,
    fontWeight: '600',
    marginBottom: 8,
  },
  radioGroup: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.CARD,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  radioLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  saveButton: {
    marginTop: 16,
  },
  sectionTitle: {
    color: Colors.ACCENT,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  skeletonContainer: {
    marginBottom: 24,
  },
  skeletonText: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 16,
    marginBottom: 12,
    width: '100%',
  },
  skeletonTitle: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 24,
    marginBottom: 16,
    width: '40%',
  },
  userSection: {
    marginBottom: 0,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.CARD,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: Colors.ACCENT,
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginTop: 8,
  },
  statLabel: {
    color: Colors.SECONDARY,
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

export default styles;
