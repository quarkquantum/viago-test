import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet } from 'react-native';

export const DOT_SIZE = 8;

export const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 70,
    paddingHorizontal: 20,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  dot: {
    borderRadius: DOT_SIZE / 2,
    height: DOT_SIZE,
    marginHorizontal: 4,
  },
  icon: {
    marginBottom: 20,
  },
  pagerView: {
    flex: 1,
    width: '100%',
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  slide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
});
