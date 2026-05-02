import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import type { Trip } from '@/features/trips/api/use-get-trip';
import { TripHeader } from '@/features/trips/components/trip-header';
import { BaseView } from '../../components/base-view';

export const BoardingScreen = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation();

  return (
    <BaseView scrollable>
      <TripHeader trip={trip} />
      <Text>boarding</Text>
    </BaseView>
  );
};
