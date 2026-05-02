import type { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
};

export const ScreenLayout = ({ children }: Props) => <View style={{ flex: 1 }}>{children}</View>;
