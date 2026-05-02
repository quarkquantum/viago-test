import type BottomSheet from '@gorhom/bottom-sheet';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { Bus, Calendar, Filter, MapPin, Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import { RouteCard } from '@/components/route-card';
import type { Route } from '@/features/trips/api/use-list-trips-routes';
import { useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';
import { DatePickerSheet } from './components/date-picker-sheet';
import { type RideFilters, RidesFilterSheet } from './components/rides-filter-sheet';
import { TripDetailsSheet } from './components/trip-details-sheet';
import { styles } from './styles';

type RidesScreenRouteProp = RouteProp<
  {
    Rides: {
      from?: string;
      to?: string;
      date?: string;
      search?: string;
    };
  },
  'Rides'
>;

function QuickFilters({ filters, onSetFilters }: { filters: RideFilters; onSetFilters: (f: RideFilters) => void }) {
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = dayjs(filters.date).isSame(today, 'day');
  const isTomorrow = dayjs(filters.date).isSame(tomorrow, 'day');

  return (
    <View style={styles.quickFilters}>
      <Text style={styles.quickFiltersLabel}>{t('screens.rides.quick_filters')}</Text>
      <View style={styles.quickFiltersRow}>
        <TouchableOpacity
          onPress={() => onSetFilters({ ...filters, date: today })}
          style={[styles.quickChip, isToday && styles.quickChipActive]}
        >
          <Calendar color={isToday ? Colors.BACKGROUND : Colors.PRIMARY} size={13} />
          <Text style={[styles.quickChipText, isToday && styles.quickChipTextActive]}>{t('screens.rides.today')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSetFilters({ ...filters, date: tomorrow })}
          style={[styles.quickChip, isTomorrow && styles.quickChipActive]}
        >
          <Calendar color={isTomorrow ? Colors.BACKGROUND : Colors.PRIMARY} size={13} />
          <Text style={[styles.quickChipText, isTomorrow && styles.quickChipTextActive]}>
            {t('screens.rides.tomorrow')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RidesListHeader({
  activeFiltersCount,
  filters,
  onClearFilters,
  onSetFilters,
}: {
  activeFiltersCount: number;
  filters: RideFilters;
  onClearFilters: () => void;
  onSetFilters: (f: RideFilters) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersRow}>
            <Text style={styles.activeFiltersLabel}>
              {t('screens.rides.active_filters')} ({activeFiltersCount})
            </Text>
            <TouchableOpacity onPress={onClearFilters}>
              <Text style={styles.clearAllText}>{t('common.clear_all')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {filters.from.length > 0 && (
              <View style={styles.chip}>
                <MapPin color={Colors.PRIMARY} size={12} />
                <Text style={styles.chipText}>{filters.from}</Text>
                <TouchableOpacity onPress={() => onSetFilters({ ...filters, from: '' })}>
                  <X color={Colors.PRIMARY} size={12} />
                </TouchableOpacity>
              </View>
            )}
            {filters.to.length > 0 && (
              <View style={styles.chip}>
                <MapPin color={Colors.SECONDARY} size={12} />
                <Text style={styles.chipText}>{filters.to}</Text>
                <TouchableOpacity onPress={() => onSetFilters({ ...filters, to: '' })}>
                  <X color={Colors.PRIMARY} size={12} />
                </TouchableOpacity>
              </View>
            )}
            {!dayjs(filters.date).isSame(new Date(), 'day') && (
              <View style={styles.chip}>
                <Calendar color={Colors.PRIMARY} size={12} />
                <Text style={styles.chipText}>{dayjs(filters.date).format('DD MMM YYYY')}</Text>
                <TouchableOpacity onPress={() => onSetFilters({ ...filters, date: new Date() })}>
                  <X color={Colors.PRIMARY} size={12} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
      <QuickFilters filters={filters} onSetFilters={onSetFilters} />
    </>
  );
}

function RidesList({
  routes,
  isFetching,
  page,
  onEndReached,
  searchQuery,
  filters,
  activeFiltersCount,
  onClearSearch,
  onClearFilters,
  onSetFilters,
  onRoutePress,
}: {
  routes: Route[];
  isFetching: boolean;
  page: number;
  onEndReached: () => void;
  searchQuery: string;
  filters: RideFilters;
  activeFiltersCount: number;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onSetFilters: (f: RideFilters) => void;
  onRoutePress: (route: Route) => void;
}) {
  const { t } = useTranslation();
  const { scrollHandler, insets } = Screen.useContext();

  return (
    <FlashList
      contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: insets.bottom + 24,
      }}
      data={routes}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      keyExtractor={(item) => item.trip.id}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Bus color={Colors.ACCENT} size={40} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery.length > 0 || activeFiltersCount > 0
              ? t('screens.rides.no_results_title')
              : t('screens.rides.noRidesFound')}
          </Text>
          <Text style={styles.emptyMessage}>{t('screens.rides.noRidesMessage')}</Text>
          {(searchQuery.length > 0 || activeFiltersCount > 0) && (
            <TouchableOpacity
              onPress={() => {
                onClearSearch();
                onClearFilters();
              }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>{t('common.clear_all')}</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      ListFooterComponent={
        isFetching && page > 1 ? (
          <View style={styles.listFooter}>
            <ActivityIndicator color={Colors.PRIMARY} size="small" />
          </View>
        ) : null
      }
      ListHeaderComponent={
        <RidesListHeader
          activeFiltersCount={activeFiltersCount}
          filters={filters}
          onClearFilters={onClearFilters}
          onSetFilters={onSetFilters}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onScroll={scrollHandler}
      renderItem={({ item }) => <RouteCard onPress={() => onRoutePress(item)} route={item} />}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const RidesScreen = () => {
  const route = useRoute<RidesScreenRouteProp>();
  const { t } = useTranslation();
  const params = route.params ?? {};

  const filterSheetRef = useRef<BottomSheet>(null);
  const datePickerSheetRef = useRef<BottomSheet>(null);
  const tripDetailsSheetRef = useRef<BottomSheet>(null);

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [searchQuery, setSearchQuery] = useState(params.search ?? '');
  const [filters, setFilters] = useState<RideFilters>({
    from: params.from ?? '',
    to: params.to ?? '',
    date: params.date ? new Date(params.date) : new Date(),
  });
  const [pendingDate, setPendingDate] = useState<Date>(filters.date);

  const [page, setPage] = useState(1);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.from.length > 0) {
      count++;
    }
    if (filters.to.length > 0) {
      count++;
    }
    if (!dayjs(filters.date).isSame(new Date(), 'day')) {
      count++;
    }
    return count;
  }, [filters]);

  const { data, isLoading, isFetching, refetch } = useListTripsRoutes({
    fromStation: filters.from,
    toStation: filters.to,
    startDate: filters.date.toISOString(),
    q: searchQuery,
    limit: '10',
    page: String(page),
  });

  useEffect(() => {
    if (data?.data) {
      const filtered = data.data.filter((item): item is Route => item != null);
      setAllRoutes((prev) => (page === 1 ? filtered : [...prev, ...filtered]));
    }
  }, [data, page]);

  const applyFilters = () => {
    setPage(1);
    filterSheetRef.current?.close();
    setTimeout(() => refetch(), 0);
  };

  const clearFilters = () => {
    setFilters({ from: '', to: '', date: new Date() });
    setPage(1);
    filterSheetRef.current?.close();
    setTimeout(() => refetch(), 0);
  };

  const handleSetFilters = (f: RideFilters) => {
    setFilters(f);
    setPage(1);
    setTimeout(() => refetch(), 0);
  };

  const loadMore = () => {
    if (!isFetching && data?.pagination && data.pagination.current < data.pagination.pages) {
      setPage((p) => p + 1);
    }
  };

  const actions: ScreenAction[] = [
    {
      type: 'icon',
      icon: Filter,
      onPress: () => filterSheetRef.current?.expand(),
      badgeCount: activeFiltersCount,
    },
  ];

  return (
    <>
      <Screen actions={actions} scrollable={false} title={t('screens.rides.title')}>
        {/* Sticky search bar */}
        <View style={styles.searchBar}>
          <Search color={Colors.SECONDARY} size={16} />
          <TextInput
            onChangeText={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            placeholder={t('screens.rides.searchPlaceholder')}
            placeholderTextColor={Colors.SECONDARY}
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={Colors.SECONDARY} size={16} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.searchBorder} />

        {isLoading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.PRIMARY} size="large" />
          </View>
        ) : (
          <RidesList
            activeFiltersCount={activeFiltersCount}
            filters={filters}
            isFetching={isFetching}
            onClearFilters={clearFilters}
            onClearSearch={() => setSearchQuery('')}
            onEndReached={loadMore}
            onRoutePress={(route) => {
              setSelectedRoute(route);
              tripDetailsSheetRef.current?.expand();
            }}
            onSetFilters={handleSetFilters}
            page={page}
            routes={allRoutes}
            searchQuery={searchQuery}
          />
        )}
      </Screen>

      <Portal>
        <TripDetailsSheet ref={tripDetailsSheetRef} route={selectedRoute} />
        <RidesFilterSheet
          filters={filters}
          onApply={applyFilters}
          onClear={clearFilters}
          onFiltersChange={setFilters}
          onOpenDatePicker={() => {
            setPendingDate(filters.date);
            datePickerSheetRef.current?.expand();
          }}
          ref={filterSheetRef}
        />
        <DatePickerSheet
          date={pendingDate}
          onChange={setPendingDate}
          onClear={() => {
            setPendingDate(new Date());
            setFilters((prev) => ({ ...prev, date: new Date() }));
            datePickerSheetRef.current?.close();
          }}
          onConfirm={() => {
            setFilters((prev) => ({ ...prev, date: pendingDate }));
            datePickerSheetRef.current?.close();
          }}
          ref={datePickerSheetRef}
        />
      </Portal>
    </>
  );
};
