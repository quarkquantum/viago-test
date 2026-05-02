import { NotificationItem } from '@repo/design-system/mobile/components/notification-item';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { EmptyScreen } from '@/components/empty-screen';
import { useListNotifications } from '@/features/notifications/api/use-list-notifications';
import { styles } from './styles';

function NotificationsList() {
  const { t, i18n } = useTranslation();
  const { scrollHandler } = Screen.useContext();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useListNotifications();

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
        <EmptyScreen description={t('notifications.emptyDescription')} icon={Bell} title={t('notifications.empty')} />
      </View>
    );
  };

  if (!isLoading && notifications.length === 0) {
    return renderEmpty();
  }

  return (
    <FlashList
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
            // TODO: handle notification press
          }}
          t={t}
        />
      )}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const NotificationsScreen = () => {
  const { t } = useTranslation();

  return (
    <Screen back padded scrollable={false} title={t('notifications.title')}>
      <NotificationsList />
    </Screen>
  );
};
