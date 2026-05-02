import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { useTranslation } from 'react-i18next';

type Props = {
  children: React.ReactNode;
  actions?: ScreenAction[];
  scrollable?: boolean;
};

export const BaseView = ({ children, actions, scrollable = true }: Props) => {
  const { t } = useTranslation();

  return (
    <Screen actions={actions} back scrollable={scrollable} title={t('trips.details.title')}>
      {children}
    </Screen>
  );
};
