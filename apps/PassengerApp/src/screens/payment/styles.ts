import { Colors } from '@repo/shared/constants';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bookingIdText: {
    color: Colors.TEXT,
    fontSize: 14,
    marginTop: 16,
    opacity: 0.5,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    marginTop: 24,
    minWidth: 200,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: Colors.BACKGROUND,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.PRIMARY,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    color: Colors.TEXT,
    fontSize: 16,
    marginTop: 12,
    opacity: 0.7,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  statusTitle: {
    color: Colors.TEXT,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
    textAlign: 'center',
  },
});
