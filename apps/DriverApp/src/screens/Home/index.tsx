import { useNavigation } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { Bell, Bus, Calendar } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { EmptyTripsState } from '@/components/home/empty-trips-state';
import { SummaryCard } from '@/components/home/summary-card';
import { TripCard } from '@/components/trip-card';
import { useAuth } from '@/contexts/auth-context';
import { useGetDashboard } from '@/features/me/api/use-get-dashboard';
import { useGetMe } from '@/features/me/api/use-get-me';
import type { RootNav } from '@/navigation/RootNavigator';
import { registerFcmToken } from '@/utils/fcm';

export const HomeScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: dashboard, isLoading, refetch, isRefetching } = useGetDashboard();
  const { data: userData } = useGetMe();
  const userName = userData?.profile?.firstName || user?.email?.split('@')[0] || 'Driver';

  const handleTripPress = useCallback(
    (tripId: string) => {
      navigation.navigate('Trip', { tripId });
    },
    [navigation]
  );

  useEffect(() => {
    registerFcmToken();
  }, []);

  const actions: ScreenAction[] = [
    {
      badgeCount: dashboard?.unreadNotifications?.length || 0,
      icon: Bell,
      onPress: () => navigation.navigate('Notifications'),
      type: 'icon',
    },
  ];

  return (
    <Screen actions={actions} title={t('screens.home.greeting', { name: userName })}>
      {isLoading && !dashboard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.PRIMARY} />
        </View>
      ) : dashboard ? (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <SummaryCard
              icon={<Bus color={Colors.PRIMARY} size={20} />}
              label={t('screens.home.upcomingAssignment')}
              value={dashboard?.upcomingTrips.length}
            />
            <SummaryCard
              icon={<Calendar color={Colors.PRIMARY} size={20} />}
              label={t('screens.home.nextTrip')}
              value={dashboard.nextTrip ? dayjs(dashboard.nextTrip.departureTime).format('ddd, DD MMM') : '-'}
            />
          </View>

          {/* Ongoing Trip Section */}
          {dashboard.currentTrip && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('screens.home.ongoingTrip')}</Text>
              <TripCard
                onPress={() => dashboard.currentTrip && handleTripPress(dashboard.currentTrip.id)}
                trip={dashboard.currentTrip}
              />
            </View>
          )}

          {/* Upcoming Trips List */}
          <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('screens.home.upcomingTrips')}</Text>
              {(dashboard?.upcomingTrips?.length ?? 0) > 5 && (
                <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Trips' })}>
                  <Text style={styles.seeAllText}>{t('common.seeMore')}</Text>
                </Pressable>
              )}
            </View>

            <FlashList
              data={dashboard?.upcomingTrips?.slice(0, 5)}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                isLoading ? null : <EmptyTripsState isRefreshing={isRefetching} onRefresh={refetch} />
              }
              onRefresh={refetch}
              refreshing={isRefetching}
              renderItem={({ item }) => <TripCard onPress={() => handleTripPress(item.id)} trip={item} />}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{t('screens.home.loadingFailed')}</Text>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    marginTop: 12,
  },
  tripCardWrapper: {
    width: Dimensions.get('window').width * 0.8,
    paddingRight: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
  },
});
