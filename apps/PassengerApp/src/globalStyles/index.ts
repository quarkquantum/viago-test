import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
    height: '100%',
    padding: 12,
    paddingBottom: 0,
    paddingTop: 0,
  },
  flex: {
    flex: 1,
  },
  label: {
    alignSelf: 'flex-start',
    color: Colors.TEXT,
    fontFamily: Fonts.bold,
    fontSize: 14,
    marginVertical: 5,
  },
});

export default globalStyles;
