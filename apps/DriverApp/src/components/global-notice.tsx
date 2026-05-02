import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { Info } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '@/contexts/network-context';

export const GlobalNotice = () => {
  const { t } = useTranslation();
  const { isConnected, isOffline } = useNetwork();
  const insets = useSafeAreaInsets();
  const heightAnim = useRef(new Animated.Value(0)).current;
  const wasOfflineRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isConnected === null) return;

    if (isOffline) {
      wasOfflineRef.current = true;
      // Slide in
      Animated.timing(heightAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (wasOfflineRef.current) {
      // Show "Connected" briefly then hide
      Animated.timing(heightAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      hideTimerRef.current = setTimeout(() => {
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        wasOfflineRef.current = false;
      }, 3000);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isConnected, isOffline, heightAnim]);

  const backgroundColor = isOffline ? Colors.DESTRUCTIVE : Colors.PRIMARY;
  const message = isOffline ? t('connection.lost') : t('connection.connected');
  const bannerHeight = insets.top + 40;

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bannerHeight],
  });

  return (
    <Animated.View style={[styles.container, { height: animatedHeight, backgroundColor, paddingTop: insets.top + 8 }]}>
      <Info color="white" size={16} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  text: {
    color: Colors.WHITE,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.medium,
    marginLeft: 8,
  },
});
