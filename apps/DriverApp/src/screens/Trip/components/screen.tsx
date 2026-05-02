import type { Trip } from '@/features/trips/api/use-get-trip';
import { CancelledScreen } from '../screens/cancelled';
import { CompletedScreen } from '../screens/completed';
import { DeletedScreen } from '../screens/deleted';
import { NotFoundScreen } from '../screens/not-found';
import { OngoingScreen } from '../screens/ongoing';
import { WaitingScreen } from '../screens/waiting';

type Props = {
  trip: Trip;
};

export const Screen = ({ trip }: Props) => {
  if (!trip?.screenState) {
    return <NotFoundScreen />;
  }

  const { screenState } = trip;

  switch (screenState.screen) {
    case 'boarding':
      return <WaitingScreen trip={trip} />;
    case 'ongoing':
      return <OngoingScreen trip={trip} />;
    case 'completed':
      return <CompletedScreen trip={trip} />;
    case 'cancelled':
      return <CancelledScreen />;
    case 'deleted':
      return <DeletedScreen />;
    case 'waiting':
      return <WaitingScreen trip={trip} />;

    default:
      return <NotFoundScreen />;
  }
};
