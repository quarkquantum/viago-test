import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useNetwork } from '@/contexts/network-context';
import { queueLength } from '@/lib/offline-queue';

export const PendingActionsBanner = () => {
  const { t } = useTranslation();
  const { isOffline } = useNetwork();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(queueLength());
    const interval = setInterval(() => {
      setCount(queueLength());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isOffline || count === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('connection.pendingActions', { count })}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  text: {
    color: Colors.WHITE,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
  },
});
