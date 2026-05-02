import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '@repo/shared/constants';
import { TransactionStatus } from '@repo/shared/constants/transaction';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { useCheckPaymentStatus, useInitPayment } from '@/features/payments/api';
import { env } from '@/keys';
import type { RootStackParamList } from '@/navigation/root-navigator';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

type PaymentState = 'idle' | 'processing' | 'checking' | 'success' | 'failed' | 'pending';

export const PaymentScreen = ({ route, navigation }: Props) => {
  const { bookingId } = route.params;
  const { t } = useTranslation();

  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentReference, setPaymentReference] = useState<string | null>(undefined);

  const initPaymentMutation = useInitPayment();

  const { data: paymentStatus, refetch: refetchPaymentStatus } = useCheckPaymentStatus(paymentReference || '', {
    enabled: Boolean(paymentReference) && paymentState === 'checking',
  });

  // Handle payment status check result
  useEffect(() => {
    if (paymentStatus?.data && paymentState === 'checking') {
      const status = paymentStatus.data.status;

      if (status === TransactionStatus.COMPLETE) {
        setPaymentState('success');
      } else if (status === TransactionStatus.FAILED || status === TransactionStatus.CANCELED) {
        setPaymentState('failed');
      } else {
        // Still pending or processing
        setPaymentState('pending');
      }
    }
  }, [paymentStatus, paymentState]);

  const openPaymentBrowser = useCallback(
    async (url: string) => {
      try {
        if (await InAppBrowser.isAvailable()) {
          setPaymentState('processing');

          const result = await InAppBrowser.open(url, {
            // IOS Options
            dismissButtonStyle: 'close',
            preferredBarTintColor: Colors.ACCENT,
            preferredControlTintColor: Colors.BACKGROUND,
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',
            modalTransitionStyle: 'coverVertical',
            modalEnabled: true,
            enableBarCollapsing: false,
            // Android Options
            showTitle: true,
            toolbarColor: Colors.ACCENT,
            secondaryToolbarColor: Colors.BACKGROUND,
            navigationBarColor: Colors.ACCENT,
            navigationBarDividerColor: Colors.ACCENT,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: false,
            animations: {
              endEnter: 'slide_in_left',
              endExit: 'slide_out_right',
              startEnter: 'slide_in_right',
              startExit: 'slide_out_left',
            },
          });

          // Browser closed, check payment status
          if (result.type === 'cancel' || result.type === 'dismiss') {
            setPaymentState('checking');
            refetchPaymentStatus();
          }
        } else {
          Alert.alert(t('payment.error'), t('payment.browserNotAvailable'));
        }
      } catch (error) {
        console.error('Browser error:', error);
        Alert.alert(t('payment.error'), t('payment.browserError'));
        setPaymentState('idle');
      }
    },
    [refetchPaymentStatus, t]
  );

  const handlePayNow = useCallback(async () => {
    try {
      setPaymentState('processing');

      const callbackUrl = `${env.NEXT_PUBLIC_API_URL}/api/app/payments/webhook`;

      const result = await initPaymentMutation.mutateAsync({
        bookingId,
        callbackUrl,
      });

      if (result.data?.authorizationUrl) {
        setPaymentReference(result.data.reference);
        await openPaymentBrowser(result.data.authorizationUrl);
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Payment init error:', error);
      Alert.alert(t('payment.error'), t('payment.initFailed'));
      setPaymentState('idle');
    }
  }, [bookingId, initPaymentMutation, openPaymentBrowser, t]);

  const handleRetry = useCallback(() => {
    setPaymentState('idle');
    setPaymentReference(undefined);
  }, []);

  const handleGoToTickets = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'MyTickets' });
  }, [navigation]);

  const renderContent = () => {
    switch (paymentState) {
      case 'processing': {
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator color={Colors.PRIMARY} size="large" />
            <Text style={styles.statusText}>{t('payment.processing')}</Text>
          </View>
        );
      }

      case 'checking': {
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator color={Colors.PRIMARY} size="large" />
            <Text style={styles.statusText}>{t('payment.checkingStatus')}</Text>
          </View>
        );
      }

      case 'success': {
        return (
          <View style={styles.centerContent}>
            <CheckCircle color={Colors.PRIMARY} size={80} />
            <Text style={styles.statusTitle}>{t('payment.success')}</Text>
            <Text style={styles.statusText}>{t('payment.successMessage')}</Text>
            <TouchableOpacity onPress={handleGoToTickets} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t('payment.viewTickets')}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      case 'failed': {
        return (
          <View style={styles.centerContent}>
            <XCircle color={Colors.DESTRUCTIVE} size={80} />
            <Text style={styles.statusTitle}>{t('payment.failed')}</Text>
            <Text style={styles.statusText}>{t('payment.failedMessage')}</Text>
            <TouchableOpacity onPress={handleRetry} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t('payment.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      case 'pending': {
        return (
          <View style={styles.centerContent}>
            <Clock color={Colors.WARNING} size={80} />
            <Text style={styles.statusTitle}>{t('payment.pending')}</Text>
            <Text style={styles.statusText}>{t('payment.pendingMessage')}</Text>
            <TouchableOpacity onPress={() => refetchPaymentStatus()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t('payment.checkAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoToTickets} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t('payment.goHome')}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      default: {
        // Idle
        return (
          <View style={styles.centerContent}>
            <AlertCircle color={Colors.PRIMARY} size={60} />
            <Text style={styles.statusTitle}>{t('payment.title')}</Text>
            <Text style={styles.statusText}>{t('payment.description')}</Text>
            <Text style={styles.bookingIdText}>
              {t('payment.bookingId')}: {bookingId}
            </Text>
            <TouchableOpacity
              disabled={initPaymentMutation.isPending}
              onPress={handlePayNow}
              style={styles.primaryButton}
            >
              {initPaymentMutation.isPending ? (
                <ActivityIndicator color={Colors.BACKGROUND} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('payment.payNow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};
