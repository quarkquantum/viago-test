import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { Button, Text, useTheme } from 'react-native-paper';
import { toast } from 'sonner-native';
import { appAuthClient } from '@/auth/client';
import { useAuth } from '@/contexts/auth-context';
import type { RootNav, RootStackParamList } from '@/navigation/root-navigator';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPInput'>;

export const OTPInputScreen = ({ route }: Props) => {
  const { email } = route.params;
  const theme = useTheme();
  const auth = useAuth();
  const navigation = useNavigation<RootNav>();
  const { t } = useTranslation();

  // OTP value (6-digit string)
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Start cooldown timer when component mounts (code was just sent)
  React.useEffect(() => {
    // Set initial cooldown to 10 minutes (600 seconds)
    setCooldownSeconds(600);
  }, []);

  // Countdown timer
  React.useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert(t('screens.otp.invalidOtp'), t('screens.otp.enterAllDigits'));
      return;
    }

    try {
      setLoading(true);
      await auth.verifyEmail({ email, otp, type: 'email-verification' });
      toast.success(t('screens.otp.emailVerified'));
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.log(error);
      Alert.alert(t('screens.otp.verificationFailed'), error?.message || t('screens.otp.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0) {
      return;
    }

    try {
      setResending(true);
      await appAuthClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' });
      toast.success(t('screens.otp.newCodeSent'));
      // Reset cooldown to 10 minutes
      setCooldownSeconds(600);
    } catch {
      Alert.alert(t('screens.otp.error'), t('screens.otp.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title} variant="headlineMedium">
        {t('screens.otp.title')}
      </Text>
      <Text style={styles.subtitle} variant="bodyMedium">
        {t('screens.otp.subtitle')}
      </Text>
      <Text style={styles.email} variant="bodyLarge">
        {email}
      </Text>

      {/* OTP Input */}
      <OtpInput
        autoFocus
        blurOnFilled={false}
        focusColor={theme.colors.primary}
        hideStick={false}
        numberOfDigits={6}
        onFilled={(text) => console.log('OTP filled:', text)}
        onTextChange={setOtp}
        placeholder="******"
        secureTextEntry={false}
        textInputProps={{
          accessibilityLabel: 'One-Time Password',
        }}
        theme={{
          containerStyle: styles.otpContainer,
          filledPinCodeContainerStyle: styles.pinCodeBoxFilled,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.pinCodeBoxFocused,
          pinCodeContainerStyle: styles.pinCodeBox,
          pinCodeTextStyle: styles.pinCodeText,
          placeholderTextStyle: styles.placeholderText,
        }}
        type="numeric"
      />

      <Button
        contentStyle={styles.buttonContent}
        disabled={otp.length !== 6 || loading}
        loading={loading}
        mode="contained"
        onPress={handleVerify}
        style={styles.button}
      >
        {t('screens.otp.verify')}
      </Button>

      <Button
        disabled={cooldownSeconds > 0 || resending}
        loading={resending}
        mode="text"
        onPress={handleResend}
        style={styles.resend}
      >
        {cooldownSeconds > 0
          ? t('screens.otp.resendIn', { seconds: formatTime(cooldownSeconds) })
          : t('screens.otp.resend')}
      </Button>
    </View>
  );
};
