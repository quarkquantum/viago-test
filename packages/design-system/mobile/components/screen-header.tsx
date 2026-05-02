import { useNavigation } from '@react-navigation/native';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Keyboard, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge } from 'react-native-paper';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ExpandableSearchInput from './expandable-search-input';

const HEADER_MAX_HEIGHT = 75;
const HEADER_MIN_HEIGHT = 50;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type BaseAction = {
  onPress: () => void;
  disabled?: boolean;
};

type IconAction = BaseAction & {
  type: 'icon';
  icon: LucideIcon;
  badgeCount?: number;
};

type AvatarAction = BaseAction & {
  type: 'avatar';
  initials?: string;
  backgroundColor?: string;
  source?: string;
};

type TextAction = BaseAction & {
  type: 'text';
  title: string;
};

export type Action = IconAction | AvatarAction | TextAction;

type CollapsibleNavHeaderProps = {
  title?: string;
  actions?: Action[];
  backgroundColor?: string;
  titleColor?: string;
  showBorder?: boolean;
  scrollY: SharedValue<number>;
  stickyHeader?: React.ReactNode;
  stickyHeaderHeight: SharedValue<number>;
  searchable?: boolean;
  onCancel?: () => void;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onGoBackPressed?: () => void;
  value?: string;
  scrollViewRef?: React.RefObject<Animated.ScrollView | null>;
  canGoBack?: boolean;
};

const CollapsibleNavHeader: React.FC<CollapsibleNavHeaderProps> = ({
  title,
  actions = [],
  backgroundColor = Colors.ACCENT,
  titleColor = Colors.ACCENT,
  showBorder = true,
  scrollY,
  stickyHeader,
  stickyHeaderHeight,
  searchable,
  onCancel,
  onChangeText,
  onSearch,
  onGoBackPressed,
  value,
  scrollViewRef,
  canGoBack = true,
}) => {
  const insets = useSafeAreaInsets();
  const [isSearchExpanded, setSearchExpanded] = useState(false);
  const actionsOpacity = useSharedValue(1);
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
    }
  }, []);

  useEffect(() => {
    actionsOpacity.value = withTiming(isSearchExpanded ? 0 : 1, {
      duration: 200,
    });
  }, [actionsOpacity, isSearchExpanded]);

  const handleChevronPress = () => {
    if (canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );

    const paddingTop = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [insets.top + 20, insets.top + 8],
      Extrapolation.CLAMP
    );

    return {
      height: withSpring(height),
      paddingTop: withSpring(paddingTop),
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 40], [22, 18], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 40], [0, -6], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0.9], Extrapolation.CLAMP);

    return {
      fontSize: withTiming(fontSize, { duration: 150 }),
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withTiming(translateY, { duration: 150 }) }],
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 40], [28, 20], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 40], [0, -6], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0.9], Extrapolation.CLAMP);

    return {
      fontSize: withTiming(fontSize, { duration: 150 }),
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withTiming(translateY, { duration: 150 }) }],
    };
  });

  const actionsAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [1, 0.85], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [0, -4], Extrapolation.CLAMP);

    return {
      transform: [{ scale: withSpring(scale) }, { translateY: withSpring(translateY) }],
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.3],
      [0, showBorder ? 1 : 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const headerContentAnimatedStyle = useAnimatedStyle(() => {
    const paddingBottom = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [16, (HEADER_MIN_HEIGHT - 40) / 2],
      Extrapolation.CLAMP
    );

    return {
      paddingBottom: withTiming(paddingBottom, { duration: 150 }),
    };
  });

  const stickyHeaderAnimatedStyle = useAnimatedStyle(() => {
    const top = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );

    return {
      top: withSpring(top),
    };
  });

  const actionsOpacityStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const renderAction = (action: Action, index: number) => {
    const isIcon = action.type === 'icon';
    const isAvatar = action.type === 'avatar';
    const isText = action.type === 'text';

    const commonOpacity = action.disabled ? 0.5 : 1;

    if (isAvatar) {
      return (
        <TouchableOpacity
          disabled={action.disabled}
          key={index}
          onPress={action.onPress}
          style={[styles.actionButton, styles.avatarButton, { opacity: commonOpacity }]}
        >
          {action.source ? (
            <Avatar.Image size={32} source={{ uri: action.source }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: action.backgroundColor || Colors.PRIMARY }]}>
              <Text style={styles.avatarText}>{action.initials || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (isIcon) {
      return (
        <TouchableOpacity
          disabled={action.disabled}
          key={index}
          onPress={action.onPress}
          style={[styles.actionButton, { opacity: commonOpacity }]}
        >
          <View style={styles.iconContainer}>
            {action.badgeCount !== undefined && action.badgeCount > 0 && (
              <Badge size={18} style={{ position: 'absolute', top: -4, right: -4 }}>
                {action.badgeCount}
              </Badge>
            )}
            <action.icon color={Colors.ACCENT} size={18} />
          </View>
        </TouchableOpacity>
      );
    }

    if (isText) {
      return (
        <TouchableOpacity
          disabled={action.disabled}
          key={index}
          onPress={action.onPress}
          style={[styles.actionButton, { opacity: commonOpacity }]}
        >
          <Text style={styles.actionText}>{action.title}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={{ marginBottom: stickyHeader ? 18 : 0 }}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      <Animated.View style={[styles.header, { backgroundColor }, headerAnimatedStyle]}>
        <Animated.View style={[styles.headerContent, headerContentAnimatedStyle]}>
          <View style={styles.titleContainer}>
            {canGoBack && (
              <TouchableOpacity
                activeOpacity={canGoBack ? 0.7 : 1}
                disabled={!canGoBack}
                onPress={onGoBackPressed ?? handleChevronPress}
                style={styles.chevronButton}
              >
                <Animated.View style={[styles.chevronContainer, chevronAnimatedStyle]}>
                  <ChevronLeft color={canGoBack ? titleColor : Colors.ACCENT} size={28} />
                </Animated.View>
              </TouchableOpacity>
            )}
            <Animated.Text
              numberOfLines={1}
              onPress={() => {
                scrollViewRef?.current?.scrollTo({ animated: true, y: 0 });
              }}
              selectable={false}
              style={[styles.title, { color: titleColor }, titleAnimatedStyle]}
              suppressHighlighting={true}
            >
              {title}
            </Animated.Text>
          </View>
          <Animated.View style={[styles.actionsContainer, actionsAnimatedStyle]}>
            <Animated.View style={[styles.inlineActions, actionsOpacityStyle]}>
              {!isSearchExpanded && actions.map((action, index) => renderAction(action, index))}
            </Animated.View>
            {searchable && (
              <ExpandableSearchInput
                onCancel={onCancel}
                onChangeText={onChangeText}
                onExpandChange={setSearchExpanded}
                onSearch={onSearch}
                value={value || ''}
              />
            )}
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.border, borderAnimatedStyle]} />
      </Animated.View>
      {stickyHeader && (
        <Animated.View
          onLayout={(event) => {
            stickyHeaderHeight.value = event.nativeEvent.layout.height;
          }}
          style={[styles.stickyHeader, stickyHeaderAnimatedStyle]}
        >
          {stickyHeader}
        </Animated.View>
      )}
    </View>
  );
};

export const useCollapsibleHeader = () => {
  const scrollY = useSharedValue(0);
  const stickyHeaderHeight = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return { scrollHandler, scrollY, stickyHeaderHeight };
};

export type CollapsibleHeaderWrapperProps = {
  title?: string;
  actions?: Action[];
  children: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  showBorder?: boolean;
  contentContainerStyle?: ViewStyle;
  stickyHeader?: React.ReactNode;
  searchable?: boolean;
  onCancel?: () => void;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onGoBackPressed?: () => void;
  value?: string;
  scrollable?: boolean;
  canGoBack?: boolean;
  [key: string]: any;
};

export const CollapsibleHeaderWrapper: React.FC<CollapsibleHeaderWrapperProps> = ({
  title,
  actions,
  children,
  backgroundColor = Colors.BACKGROUND,
  titleColor = Colors.ACCENT,
  showBorder = true,
  contentContainerStyle,
  stickyHeader,
  searchable,
  scrollable = true,
  onCancel,
  onChangeText,
  onSearch,
  onGoBackPressed,
  value,
  canGoBack = true,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets();
  const { scrollHandler, scrollY, stickyHeaderHeight } = useCollapsibleHeader();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const staticPaddingTop = HEADER_MAX_HEIGHT + insets.top - 15 + (stickyHeader ? stickyHeaderHeight.value : 0);

  const scrollViewContentStyle = useAnimatedStyle(() => {
    const basePaddingTop = HEADER_MAX_HEIGHT + insets.top;
    const stickyPadding = stickyHeader ? stickyHeaderHeight.value : 0;
    const paddingTop = basePaddingTop + stickyPadding;
    return {
      paddingTop,
    };
  });

  return (
    <View style={styles.container}>
      <CollapsibleNavHeader
        actions={actions}
        backgroundColor={backgroundColor}
        canGoBack={canGoBack}
        onCancel={onCancel}
        onChangeText={onChangeText}
        onGoBackPressed={onGoBackPressed}
        onSearch={onSearch}
        scrollViewRef={scrollViewRef}
        scrollY={scrollY}
        searchable={searchable}
        showBorder={showBorder}
        stickyHeader={stickyHeader}
        stickyHeaderHeight={stickyHeaderHeight}
        title={title}
        titleColor={titleColor}
        value={value}
      />

      {scrollable ? (
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          onScroll={scrollHandler}
          onScrollBeginDrag={Keyboard.dismiss}
          ref={scrollViewRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          {...scrollViewProps}
        >
          <Animated.View style={scrollViewContentStyle}>{children}</Animated.View>
        </Animated.ScrollView>
      ) : (
        <SafeAreaView
          edges={['bottom']}
          style={[
            {
              flex: 1,
              paddingTop: staticPaddingTop,
            },
            styles.scrollContent,
            contentContainerStyle,
          ]}
        >
          {children}
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: 4,
  },
  actionText: {
    color: Colors.ACCENT,
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 3,
    justifyContent: 'flex-end',
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  avatarButton: {
    padding: 0,
  },
  avatarText: {
    color: Colors.BACKGROUND,
    fontSize: 14,
    fontWeight: '600',
  },
  border: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    bottom: 0,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  chevronButton: {
    marginRight: 4,
    padding: 4,
    paddingLeft: 0,
  },
  chevronContainer: {
    // MarginRight: 8, // Removed since we're using padding on the button
  },
  container: {
    backgroundColor: Colors.BACKGROUND,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    justifyContent: 'flex-end',
    left: 0,
    paddingHorizontal: 18,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 100,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#fff',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 999,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
});
