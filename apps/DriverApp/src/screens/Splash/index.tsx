import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared/constants';
import { useEffect, useState } from 'react';
import { ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useGetMe } from '@/features/me/api/use-get-me';
import type { RootNav, RootStackParamList } from '@/navigation/RootNavigator';
import { registerFcmToken } from '@/utils/fcm';
import styles from './styles';

export const SplashScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { user } = useAuth();
  const { data: meData, isLoading: isLoadingMe, isError } = useGetMe({ enabled: !!user });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      registerFcmToken();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 1 ? 1 : prev + 0.01));
    }, 15);

    const timer = setTimeout(() => {
      clearInterval(interval);
      console.log('[SplashScreen] Timer finished. State:', {
        hasUser: !!user,
        isLoadingMe,
        hasMeData: !!meData,
        isError,
      });

      // Determine the next screen
      let nextRoute: keyof RootStackParamList;

      if (user) {
        // If logged in, we MUST wait for the latest status check
        if (isLoadingMe) {
          console.log('[SplashScreen] Still loading me data, waiting...');
          return;
        }

        // If useGetMe hook detects a ban, IT will reset navigation to 'Banned' via its internal useEffect.
        // We only proceed here if we are NOT banned.
        const isBanned = (meData && 'banned' in meData && meData.banned) || (isError && meData === undefined); // fallback for 403 cases if hook hasn't reset yet

        if (isBanned && meData?.banned) {
          console.log('[SplashScreen] User banned (data), letting hook/local handle reset');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Banned', params: { banReason: meData.banReason, banExpires: meData.banExpires } }],
          });
          return;
        }

        if (meData) {
          console.log('[SplashScreen] Status OK, going to MainTabs');
          nextRoute = 'MainTabs';
        } else {
          // If we are here, it means loading finished but we have no data (e.g. unexpected error)
          // Default to Login to be safe
          console.log('[SplashScreen] Load finished with no data, falling back to Login');
          nextRoute = 'Login';
        }
      } else {
        console.log('[SplashScreen] No session, going to Login');
        nextRoute = 'Login';
      }

      console.log('[SplashScreen] Final decision: reset to', nextRoute);
      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [user, navigation, isLoadingMe, meData, isError]);

  return (
    <SafeAreaView style={styles.container}>
      <FastImage
        resizeMode={FastImage.resizeMode.contain}
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />

      <ProgressBar color={Colors.PRIMARY} progress={progress} style={styles.progressBar} />
    </SafeAreaView>
  );
};
