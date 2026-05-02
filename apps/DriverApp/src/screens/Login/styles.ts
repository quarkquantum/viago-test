import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  error: { color: Colors.DESTRUCTIVE, fontSize: 12, marginBottom: 8, marginLeft: 12 },
  heading: { color: Colors.PRIMARY, fontFamily: Fonts.bold, fontSize: 24, marginBottom: 4 },
  image: { height: 220, marginBottom: 32, width: '100%' },
  input: {
    marginBottom: 8,
    fontSize: 16,
    height: 56,
    borderRadius: 12,
  },
  label: { color: Colors.TEXT, fontSize: 14, fontWeight: '500', marginBottom: 6, marginLeft: 4 },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  subtitle: { color: Colors.TEXT, fontSize: 16, marginBottom: 32, opacity: 0.6 },
  title: { fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  iconContainer: {
    backgroundColor: `${Colors.PRIMARY}10`,
    padding: 20,
    borderRadius: 50,
    marginBottom: 16,
  },
  quickInfoCard: {
    marginBottom: 24,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickInfoText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    height: 56,
  },
  emergencySection: {
    marginTop: 8,
  },
  emergencyButton: {
    borderColor: Colors.DESTRUCTIVE,
    borderRadius: 12,
    height: 48,
  },
});
