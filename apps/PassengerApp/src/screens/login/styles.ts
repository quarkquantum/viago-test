import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  error: { color: Colors.DESTRUCTIVE, fontSize: 12, marginBottom: 8, marginLeft: 12 },
  heading: { color: Colors.PRIMARY, fontFamily: Fonts.bold, fontSize: 24, marginBottom: 4 },
  image: { height: 220, marginBottom: 32, width: '100%' },
  input: { marginBottom: 8 },
  label: { color: Colors.TEXT, fontSize: 14, fontWeight: '500', marginBottom: 6, marginLeft: 4 },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  subtitle: { color: Colors.TEXT, fontSize: 16, marginBottom: 32, opacity: 0.6 },
  title: { fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
});
