import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared';
import { SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { RootNav } from '@/navigation/RootNavigator';
import { BaseView } from '../../components/base-view';
import { styles } from './styles';

export const NotFoundScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  const handleGoBack = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <BaseView scrollable={false}>
      <View style={styles.container}>
        <View style={styles.errorBadge}>
          <SearchX color={Colors.WARNING} size={32} strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>{t('trips.notFound.title')}</Text>
        <Text style={styles.description}>{t('trips.notFound.description')}</Text>

        <Button mode="contained" onPress={handleGoBack} style={styles.button}>
          {t('trips.notFound.backToHome')}
        </Button>
      </View>
    </BaseView>
  );
};
