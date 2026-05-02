import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  errorText: {
    color: Colors.DESTRUCTIVE,
    fontSize: 12,
    marginTop: 4,
  },
  formContainer: {
    gap: 12,
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    marginBottom: 12,
  },
});

export default styles;
