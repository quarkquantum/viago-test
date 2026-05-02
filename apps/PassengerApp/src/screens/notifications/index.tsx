import { useNavigation } from '@react-navigation/native';
import { NotificationItem } from '@repo/design-system/mobile/components/notification-item';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { useAuth } from '@/contexts/auth-context';
import { useListNotifications } from '@/features/notifications/api/use-list-notifications';
import type { RootNav } from '@/navigation/root-navigator';
import { styles } from './styles';

const GuestView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  return (
    <View style={styles.guestContainer}>
      <Bell color={Colors.ACCENT} size={56} />
      <Text style={styles.guestTitle}>{t('notifications.guest.title')}</Text>
      <Text style={styles.guestMessage}>{t('notifications.guest.message')}</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.guestButton}>
        {t('screens.settings.goToLogin')}
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Register')} style={styles.guestButton}>
        {t('screens.onboarding.signup')}
      </Button>
    </View>
  );
};

const NotificationsList = () => {
  const { t, i18n } = useTranslation();
  const { scrollHandler } = Screen.useContext();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useListNotifications(
    {},
    { enabled: true }
  );

  const notifications = data?.pages?.flatMap((page) => page.data) || [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={Colors.PRIMARY} size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Bell color={Colors.ACCENT} size={48} />
        <View style={{ height: 16 }} />
        <ActivityIndicator animating={false} />
      </View>
    );
  };

  return (
    <FlashList
      contentContainerStyle={styles.listContent}
      data={notifications}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      onScroll={scrollHandler}
      refreshing={isLoading}
      renderItem={({ item }) => (
        <NotificationItem
          language={i18n.language}
          notification={item}
          onPress={() => {
            // Handle notification press
          }}
          t={t}
        />
      )}
      scrollEventThrottle={16}
    />
  );
};

export const NotificationsScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Screen back scrollable={false} title={t('notifications.title')}>
      {user ? <NotificationsList /> : <GuestView />}
    </Screen>
  );
};
