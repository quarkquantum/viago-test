import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import type { ApiError } from '@repo/shared';
import { Colors } from '@repo/shared/constants';
import { ArrowLeft, Zap, ZapOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { toast } from 'sonner-native';
import { useScanTicket } from '@/features/tickets/api/use-scan-ticket';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type ScanRoute = RouteProp<RootStackParamList, 'Scan'>;

const getErrorReason = (error: ApiError) => {
  if (!error.details || typeof error.details !== 'object') {
    return undefined;
  }

  const details = error.details as Record<string, unknown>;
  return typeof details.reason === 'string' ? details.reason : undefined;
};

export const ScanScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ScanRoute>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [torch, setTorch] = useState<'on' | 'off'>('off');
  const device = useCameraDevice('back');

  const { mutate: scanTicket, isPending: isScanning } = useScanTicket();
  const tripId = route.params?.tripId;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const resumeScanner = () => {
    setTimeout(() => {
      setIsProcessingScan(false);
      setIsActive(true);
    }, 900);
  };

  const getScanErrorMessage = (error: ApiError) => {
    const reason = getErrorReason(error);

    if (reason === 'expired') {
      return t('screens.scan.messages.expired');
    }

    if (reason === 'invalid_status') {
      return t('screens.scan.messages.invalid');
    }

    if (reason === 'driver_mismatch' || reason === 'unassociated_trip') {
      return t('screens.scan.messages.unassociatedTrip');
    }

    if (reason === 'not_found' || error.status === 404 || error.key === 'not_found') {
      return t('screens.scan.messages.notFound');
    }

    if (error.status === 409) {
      return t('screens.scan.messages.invalid');
    }

    if (error.status === 403) {
      return t('screens.scan.messages.unassociatedTrip');
    }

    return error.message || t('screens.scan.messages.genericError');
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (!isActive || isProcessingScan || codes.length === 0) {
        return;
      }

      const rawValue = codes[0]?.value?.trim();
      if (!rawValue) {
        return;
      }

      setIsProcessingScan(true);
      setIsActive(false);

      scanTicket(
        { key: rawValue, tripId },
        {
          onSuccess: () => {
            toast.success(t('screens.scan.messages.success'));
            resumeScanner();
          },
          onError: (error) => {
            toast.error(getScanErrorMessage(error));
            resumeScanner();
          },
        }
      );
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('screens.scan.permissionRequired')}</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>{t('screens.scan.grantPermission')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('screens.scan.noDevice')}</Text>
      </View>
    );
  }

  const scannerHint = isScanning || isProcessingScan ? t('screens.scan.processing') : t('screens.scan.scanHint');

  return (
    <View style={styles.container}>
      <Camera
        codeScanner={codeScanner}
        device={device}
        isActive={isActive}
        style={StyleSheet.absoluteFill}
        torch={torch}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color="white" size={24} />
          </Pressable>
          <Text style={styles.title}>{t('screens.scan.scanTicket')}</Text>
          <Pressable
            disabled={isScanning || isProcessingScan}
            onPress={() => setTorch((value) => (value === 'on' ? 'off' : 'on'))}
            style={[styles.iconButton, (isScanning || isProcessingScan) && styles.iconButtonDisabled]}
          >
            {torch === 'on' ? <ZapOff color="white" size={24} /> : <Zap color="white" size={24} />}
          </Pressable>
        </View>

        <View style={styles.scannerContainer}>
          <View style={styles.finder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.hint}>{scannerHint}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: 'white',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: 'white',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finder: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: 'white',
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.PRIMARY,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
});
