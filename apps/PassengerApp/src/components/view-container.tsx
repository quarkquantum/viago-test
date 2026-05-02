import { Colors } from '@repo/shared';
import type React from 'react';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StatusBar, StyleSheet, View } from 'react-native';

type ViewContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const ViewContainer: React.FC<ViewContainerProps> = ({ children, style }) => (
  <View style={[styles.container, style]}>
    <StatusBar backgroundColor="white" barStyle="dark-content" translucent={false} />
    {children}
  </View>
);

const styles = StyleSheet.create({
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
});
