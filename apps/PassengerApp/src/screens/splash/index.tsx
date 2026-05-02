import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared/constants';
import { useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import type { RootNav, RootStackParamList } from '@/navigation/root-navigator';
import { registerFcmToken } from '@/utils/fcm';
import styles from './styles';

export const SplashScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { user } = useAuth();
  const storage = createMMKV();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      registerFcmToken();
    }
  }, [user]);

  useEffect(() => {
    const onboardingStatus = storage.getBoolean('@onboarding_complete');

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 1 ? 1 : prev + 0.01));
    }, 15);

    const timer = setTimeout(() => {
      clearInterval(interval);

      // Determine the next screen
      let nextRoute: keyof RootStackParamList = 'Onboarding';

      if (onboardingStatus) {
        nextRoute = 'MainTabs';
      }

      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [user, navigation, storage.getBoolean]);

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
