import { Colors } from '@repo/shared';
import { useEffect } from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
};

export const Skeleton = ({ width, height, borderRadius = 4, style }: Props) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.ACCENT_FOREGROUND,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};
