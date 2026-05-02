import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ViewContainer } from '@/components/view-container';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Trip'>;

export const TripScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { tripId } = route.params;
  const { data: trip, isLoading = true } = useGetTrip(tripId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.PRIMARY} size="large" />
      </View>
    );
  }

  if (!trip?.screenState) {
    return (
      <ViewContainer style={styles.centered}>
        <Text>{t('trips.details.notFound')}</Text>
      </ViewContainer>
    );
  }

  return <Screen trip={trip} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
