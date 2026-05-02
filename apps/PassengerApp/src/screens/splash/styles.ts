// Styles.ts

import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared/constants';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
    justifyContent: 'center', // Optional: match your app background
  },
  logo: {
    height: 200,
    marginBottom: 20,
    width: 200,
  },
  progressBar: {
    borderRadius: 3,
    height: 6,
    width: 200,
  },
  title: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.bold,
    fontSize: 24,
    marginTop: 16,
  },
});

export default styles;
