import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared';
import { CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';
import type { RootNav } from '@/navigation/RootNavigator';
import { BaseView } from '../../components/base-view';
import { InfoSection } from './components/info-section';
import { RouteSection } from './components/route-sections';
import { StationsList } from './components/stations';
import { styles } from './styles';

type Props = {
  trip: Trip;
};

export const CompletedScreen = ({ trip }: Props) => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  const handleGoBack = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <BaseView scrollable={false}>
      <View style={styles.container}>
        <View style={styles.successBadge}>
          <CheckCircle2 color={Colors.SUCCESS} size={32} strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>{t('trips.completed.title')}</Text>
        <Text style={styles.description}>{t('trips.completed.description')}</Text>

        {/* Trip Details Card */}
        <View style={styles.tripCard}>
          {/* Route Section */}
          <RouteSection trip={trip} />

          {/* Stations */}
          <StationsList trip={trip} />

          {/* Bus & Agency Info */}
          <InfoSection trip={trip} />
        </View>

        <Button mode="contained" onPress={handleGoBack} style={styles.button}>
          {t('trips.completed.backToTrips')}
        </Button>
      </View>
    </BaseView>
  );
};
