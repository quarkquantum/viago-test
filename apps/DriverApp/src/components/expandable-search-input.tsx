import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { Search } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { Dimensions, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export type ExpandableSearchInputProps = {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChangeText?: (text: string) => void;
  onCancel?: () => void;
  onExpandChange?: (isExpanded: boolean) => void;
  value?: string;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  inputTextColor?: string;
  borderRadius?: number;
  animationDuration?: number;
  cancelText?: string;
  cancelTextColor?: string;
  showCancelButton?: boolean;
  style?: ViewStyle;
};

const ExpandableSearchInput: React.FC<ExpandableSearchInputProps> = ({
  placeholder = 'Rechercher...',
  onSearch,
  onChangeText,
  onCancel,
  onExpandChange,
  value,
  iconSize = 22,
  iconColor = Colors.ACCENT,
  backgroundColor = Colors.ACCENT_FOREGROUND,
  inputTextColor = Colors.TEXT,
  borderRadius = 25,
  animationDuration = 300,
  cancelText = 'Annuler',
  cancelTextColor = Colors.ACCENT,
  showCancelButton = true,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value || '');

  // Shared values for animations
  const animatedValue = useSharedValue(0);

  // Circle size when collapsed
  const collapsedSize = 40;

  // Cancel button width when visible
  const cancelButtonWidth = showCancelButton ? 40 : 0;

  // Expanded width (accounting for cancel button)
  const expandedWidth = screenWidth - 50 - (showCancelButton ? cancelButtonWidth + 20 : 0); // 20px margin on each side + cancel button + spacing

  const toggleExpanded = (): void => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(newExpandedState);

    animatedValue.value = withTiming(newExpandedState ? 1 : 0, {
      duration: animationDuration,
    });
  };

  const handleTextChange = (text: string): void => {
    setInputValue(text);
    onChangeText?.(text);
  };

  const handleSearch = (): void => {
    onSearch?.(inputValue);
  };

  const handleCancel = (): void => {
    setInputValue('');
    onChangeText?.('');
    onCancel?.();
    toggleExpanded();
  };

  const handleBlur = (): void => {
    if (!inputValue.trim()) {
      toggleExpanded();
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(animatedValue.value, [0, 1], [collapsedSize, expandedWidth]);

    const paddingHorizontal = interpolate(animatedValue.value, [0, 1], [0, 15]);
    const borderWidth = interpolate(animatedValue.value, [0, 1], [0, 2]);

    return {
      borderWidth,
      justifyContent: 'flex-end',
      paddingHorizontal,
      width, // Right-align so it expands left
    };
  });

  const inputAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 0.5, 1], [0, 0, 1]);

    return {
      opacity,
    };
  });

  const iconContainerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animatedValue.value, [0, 1], [0, -5]); // Was -10

    return {
      transform: [{ translateX }],
    };
  });

  const cancelButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 0.5, 1], [0, 0, 1]);

    const translateX = interpolate(animatedValue.value, [0, 1], [20, 0]);

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.wrapper}>
      {showCancelButton && isExpanded && (
        <Animated.View style={[styles.cancelButtonContainer, cancelButtonAnimatedStyle]}>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: cancelTextColor }]}>{cancelText}</Text>
          </Pressable>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.container,
          containerAnimatedStyle,
          {
            backgroundColor,
            borderColor: Colors.ACCENT,
            borderRadius,
            flexDirection: isExpanded ? 'row' : 'row-reverse',
            paddingVertical: 10,
          },
          style,
        ]}
      >
        {isExpanded ? (
          <>
            <Pressable onPress={handleSearch} style={styles.expandedIconContainer}>
              <Animated.View style={[styles.iconWrapper, iconContainerAnimatedStyle]}>
                <Search color={iconColor} size={iconSize} />
              </Animated.View>
            </Pressable>

            <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
              <TextInput
                autoFocus={true}
                cursorColor={Colors.ACCENT}
                onBlur={handleBlur}
                onChangeText={handleTextChange}
                onSubmitEditing={handleSearch}
                placeholder={placeholder}
                placeholderTextColor={iconColor}
                returnKeyType="search"
                style={[styles.textInput, { color: inputTextColor }]}
                value={inputValue}
              />
            </Animated.View>
          </>
        ) : (
          <Pressable
            onPress={toggleExpanded}
            style={[styles.collapsedIconContainer, { borderWidth: isExpanded ? 1 : 0 }]}
          >
            <Search color={iconColor} size={iconSize} />
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};

export default ExpandableSearchInput;

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  } as ViewStyle,

  cancelButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
  } as ViewStyle,

  cancelText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  } as TextStyle,
  collapsedIconContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  } as ViewStyle,
  container: {
    flexDirection: 'row-reverse', // Reverse to put icon on right
    alignItems: 'center',
    height: 40,
  } as ViewStyle,
  expandedIconContainer: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
    // BorderWidth: 1,
  } as ViewStyle,
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  inputContainer: {
    flex: 1,
  } as ViewStyle,
  textInput: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
  } as TextStyle,
  wrapper: {
    flexDirection: 'row-reverse', // Reverse layout direction
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BACKGROUND,
  } as ViewStyle,
});
