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
    const interval = setInterval(() => setCount(queueLength()), 3000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0 || !isOffline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('connection.pendingActions', { count })}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: Colors.WHITE,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.medium,
  },
});
