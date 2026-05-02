import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared';
import { CircleXIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { RootNav } from '@/navigation/RootNavigator';
import { BaseView } from '../../components/base-view';
import { styles } from '../completed/styles';

export const CancelledScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  const handleGoBack = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <BaseView scrollable={false}>
      <View style={styles.container}>
        <View style={[styles.successBadge, { backgroundColor: `${Colors.DESTRUCTIVE}15` }]}>
          <CircleXIcon color={Colors.DESTRUCTIVE} size={32} strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>{t('trips.cancelled.title')}</Text>
        <Text style={styles.description}>{t('trips.cancelled.description')}</Text>

        <Button mode="contained" onPress={handleGoBack} style={styles.button}>
          {t('trips.cancelled.backToTrips')}
        </Button>
      </View>
    </BaseView>
  );
};
