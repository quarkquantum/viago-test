import { Colors } from '@repo/shared';
import { Trash } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { BaseView } from '../../components/base-view';
import { styles } from './styles';

export const DeletedScreen = () => {
  const { t } = useTranslation();

  return (
    <BaseView scrollable={false}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Trash color={Colors.DESTRUCTIVE} size={32} />
        </View>
        <Text style={styles.title}>{t('trips.deleted.title')}</Text>
        <Text style={styles.description}>{t('trips.deleted.description')}</Text>
      </View>
    </BaseView>
  );
};
