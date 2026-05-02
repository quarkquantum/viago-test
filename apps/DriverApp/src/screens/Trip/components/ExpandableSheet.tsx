import { BlurView } from '@react-native-community/blur';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export type ExpandableSheetContentProps = {
  expansion: SharedValue<number>;
  t: TFunction;
  toggle: () => void;
  insets: EdgeInsets;
};

type Props<T extends object = object> = {
  content: React.ComponentType<ExpandableSheetContentProps & T>;
  contentProps?: T;
};

export const ExpandableSheet = <T extends object = object>({ content: Content, contentProps }: Props<T>) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const expansion = useSharedValue(0);

  const toggleExpansion = () => {
    if (expansion.value === 0) {
      expansion.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      expansion.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 1], [0, 1]),
    zIndex: expansion.value === 0 ? -1 : 2,
    pointerEvents: expansion.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <BlurView
          blurAmount={20}
          blurType="dark"
          reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity activeOpacity={1} onPress={toggleExpansion} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Content expansion={expansion} insets={insets} t={t} toggle={toggleExpansion} {...(contentProps as T)} />
    </>
  );
};
