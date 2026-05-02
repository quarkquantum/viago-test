import { useNavigation } from '@react-navigation/native';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronLeft } from 'lucide-react-native';
import type React from 'react';
import { createContext, useContext } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { Keyboard, Platform, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-paper';

import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Context ────────────────────────────────────────────────────────────────────

interface ScreenContextValue {
  insets: { top: number; bottom: number; left: number; right: number };
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollY: SharedValue<number>;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

function useScreenContext() {
  const ctx = useContext(ScreenContext);
  if (!ctx) {
    throw new Error('useScreenContext must be used inside <Screen>');
  }
  return ctx;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const HEADER_MAX_HEIGHT = 56;
const HEADER_MIN_HEIGHT = 44;
const SCROLL_THRESHOLD = 60;
const HORIZONTAL_PADDING = 20;

const TITLE_MAX_SIZE = 22;
const TITLE_MIN_SIZE = 18;

const ACTION_MAX_SIZE = 36;
const ACTION_MIN_SIZE = 32;

// ─── Action Types (discriminated union) ─────────────────────────────────────────

type IconAction = {
  type: 'icon';
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  badgeCount?: number;
};

export type ScreenAction = IconAction;

// ─── Screen Props ───────────────────────────────────────────────────────────────

type ScreenProps = {
  children: React.ReactNode;
  title: string;
  back?: boolean | (() => void);
  actions?: ScreenAction[];

  scrollable?: boolean;
  padded?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  statusBarStyle?: 'light-content' | 'dark-content';
};

// ─── Internal: Header ───────────────────────────────────────────────────────────

function Header({ title, back, actions }: { title: string; back?: boolean | (() => void); actions?: ScreenAction[] }) {
  const { scrollY, insets } = useScreenContext();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );
    return { height };
  });

  const borderOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.headerRow, headerAnimatedStyle]}>
        {back && <BackButton onPress={typeof back === 'function' ? back : undefined} />}
        <Title>{title}</Title>
        {actions && actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ignore
              <ActionButton key={i} {...action} />
            ))}
          </View>
        )}
      </Animated.View>
      <Animated.View style={[styles.headerBorder, borderOpacity]} />
    </View>
  );
}

// ─── Internal: Title ────────────────────────────────────────────────────────────

function Title({ children }: { children: string }) {
  const { scrollY } = useScreenContext();

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, TITLE_MIN_SIZE / TITLE_MAX_SIZE],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[styles.title, { fontSize: TITLE_MAX_SIZE, transformOrigin: 'left center' }, titleAnimatedStyle]}
    >
      {children}
    </Animated.Text>
  );
}

// ─── Internal: BackButton ───────────────────────────────────────────────────────

function BackButton({ onPress }: { onPress?: () => void }) {
  const navigation = useNavigation();
  const { scrollY } = useScreenContext();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const scaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, ACTION_MIN_SIZE / ACTION_MAX_SIZE],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.iconButton, styles.iconButtonSize, scaleStyle]}>
      <Pressable
        hitSlop={8}
        onPress={handlePress}
        style={({ pressed }) => [styles.iconButtonInner, pressed && styles.pressed]}
      >
        <ChevronLeft color={Colors.ACCENT} size={22} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Internal: ActionButton ─────────────────────────────────────────────────────

function ActionButton({ icon: Icon, onPress, disabled, badgeCount }: IconAction) {
  const { scrollY } = useScreenContext();

  const scaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, ACTION_MIN_SIZE / ACTION_MAX_SIZE],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.iconButton, styles.iconButtonSize, disabled && styles.disabled, scaleStyle]}>
      <Pressable
        disabled={disabled}
        hitSlop={4}
        onPress={onPress}
        style={({ pressed }) => [styles.iconButtonInner, pressed && styles.pressed]}
      >
        <Icon color={Colors.ACCENT} size={18} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge size={16} style={styles.badge}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Badge>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Internal: Body ─────────────────────────────────────────────────────────────

function Body({
  children,
  scrollable = true,
  contentContainerStyle,
  padded = true,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { scrollHandler, insets } = useScreenContext();
  const px = padded ? HORIZONTAL_PADDING : 0;

  if (!scrollable) {
    return <View style={[styles.body, { paddingHorizontal: px }]}>{children}</View>;
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.bodyContent,
        { paddingHorizontal: px, paddingBottom: insets.bottom + 24 },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      onScroll={scrollHandler}
      onScrollBeginDrag={Keyboard.dismiss}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={styles.body}
    >
      {children}
    </ScrollView>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────────

function ScreenComponent({
  children,
  title,
  back,
  actions,
  scrollable = true,
  padded = true,
  contentContainerStyle,
  statusBarStyle = 'dark-content',
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const scrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <ScreenContext.Provider value={{ scrollY, scrollHandler, insets }}>
      <View style={styles.root}>
        <StatusBar
          backgroundColor={Colors.BACKGROUND}
          barStyle={statusBarStyle}
          translucent={Platform.OS === 'android'}
        />
        <Header actions={actions} back={back} title={title} />
        <Body contentContainerStyle={contentContainerStyle} padded={padded} scrollable={scrollable}>
          {children}
        </Body>
      </View>
    </ScreenContext.Provider>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export const Screen = Object.assign(ScreenComponent, {
  useContext: useScreenContext,
});

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: HORIZONTAL_PADDING,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
    color: Colors.ACCENT,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    overflow: 'hidden',
  },
  iconButtonSize: {
    width: ACTION_MAX_SIZE,
    height: ACTION_MAX_SIZE,
    borderRadius: ACTION_MAX_SIZE / 2,
  },
  iconButtonInner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },

  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
});
