import type BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import { Bus, Calendar, Filter, MapPin, Search, X } from 'lucide-react-native';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import type { DateType } from 'react-native-ui-datepicker';
import { TripCard } from '@/components/trip-card';
import { TripCardSkeleton } from '@/components/trip-card-skeleton';
import type { UpcomingTrip } from '@/features/me/api/use-get-dashboard';
import { useListTrips } from '@/features/trips/api/use-list-trips';
import type { RootNav } from '@/navigation/RootNavigator';
import { DatePickerSheet } from './components/DatePickerSheet';
import { type TripFilters, TripsFilterSheet } from './components/TripsFilterSheet';

// ─── List header (must be outside TripsList to keep a stable component reference) ──

function TripsListHeader({
  activeFiltersCount,
  filters,
  clearFilters,
  setFilters,
}: {
  activeFiltersCount: number;
  filters: TripFilters;
  clearFilters: () => void;
  setFilters: React.Dispatch<React.SetStateAction<TripFilters>>;
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersHeader}>
            <Text style={styles.activeFiltersLabel}>
              {t('screens.trips.active_filters')} ({activeFiltersCount})
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearAllText}>{t('common.clear_all')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterChips}>
            {filters.status && (
              <View style={styles.filterChip}>
                <Filter color={Colors.PRIMARY} size={14} />
                <Text style={styles.filterChipText}>{filters.status}</Text>
                <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, status: undefined }))}>
                  <X color={Colors.PRIMARY} size={14} />
                </TouchableOpacity>
              </View>
            )}
            {filters.origin && (
              <View style={styles.filterChip}>
                <MapPin color={Colors.PRIMARY} size={14} />
                <Text style={styles.filterChipText}>{filters.origin}</Text>
                <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, origin: '' }))}>
                  <X color={Colors.PRIMARY} size={14} />
                </TouchableOpacity>
              </View>
            )}
            {filters.destination && (
              <View style={styles.filterChip}>
                <MapPin color={Colors.SECONDARY} size={14} />
                <Text style={styles.filterChipText}>{filters.destination}</Text>
                <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, destination: '' }))}>
                  <X color={Colors.PRIMARY} size={14} />
                </TouchableOpacity>
              </View>
            )}
            {filters.dateFrom && (
              <View style={styles.filterChip}>
                <Calendar color={Colors.PRIMARY} size={14} />
                <Text style={styles.filterChipText}>
                  {t('screens.trips.from')}: {filters.dateFrom.toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, dateFrom: null }))}>
                  <X color={Colors.PRIMARY} size={14} />
                </TouchableOpacity>
              </View>
            )}
            {filters.dateTo && (
              <View style={styles.filterChip}>
                <Calendar color={Colors.PRIMARY} size={14} />
                <Text style={styles.filterChipText}>
                  {t('screens.trips.to')}: {filters.dateTo.toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, dateTo: null }))}>
                  <X color={Colors.PRIMARY} size={14} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Quick Filters */}
      <View style={styles.quickFiltersContainer}>
        <Text style={styles.quickFiltersLabel}>{t('screens.trips.quick_filters')}</Text>
        <View style={styles.quickFiltersRow}>
          <TouchableOpacity
            onPress={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const end = new Date(today);
              end.setHours(23, 59, 59, 999);
              setFilters((prev) => ({ ...prev, dateFrom: today, dateTo: end }));
            }}
            style={styles.quickFilterChip}
          >
            <Calendar color={Colors.PRIMARY} size={14} />
            <Text style={styles.quickFilterChipText}>{t('screens.trips.today')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);
              const end = new Date(tomorrow);
              end.setHours(23, 59, 59, 999);
              setFilters((prev) => ({ ...prev, dateFrom: tomorrow, dateTo: end }));
            }}
            style={styles.quickFilterChip}
          >
            <Calendar color={Colors.PRIMARY} size={14} />
            <Text style={styles.quickFilterChipText}>{t('screens.trips.tomorrow')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// ─── Inner list (needs Screen context for scroll handler) ────────────────────

function TripsList({
  searchQuery,
  filters,
  activeFiltersCount,
  clearFilters,
  setSearchQuery,
  setFilters,
  handleTripPress,
}: {
  searchQuery: string;
  filters: TripFilters;
  activeFiltersCount: number;
  clearFilters: () => void;
  setSearchQuery: (q: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<TripFilters>>;
  handleTripPress: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { scrollHandler, insets } = Screen.useContext();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useListTrips({
    search: searchQuery,
    ...filters,
  });

  const trips = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const renderFooter = () => {
    if (!isFetchingNextPage) {
      return null;
    }
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.PRIMARY} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }
    const isSearching = searchQuery.length > 0;
    const hasFilters = activeFiltersCount > 0;
    const getEmptySubtitle = () => {
      if (isSearching) {
        return t('screens.trips.no_results_subtitle', { query: searchQuery });
      }
      if (hasFilters) {
        return t('screens.trips.no_filters_results');
      }
      return t('screens.trips.empty_subtitle');
    };
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconContainer}>
          <Bus color={Colors.ACCENT} size={48} />
        </View>
        <Text style={styles.emptyTitle}>
          {isSearching || hasFilters ? t('screens.trips.no_results_title') : t('screens.trips.empty_title')}
        </Text>
        <Text style={styles.emptySubtitle}>{getEmptySubtitle()}</Text>
        {(isSearching || hasFilters) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              clearFilters();
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>{t('common.clear_all')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return isLoading ? (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(item) => item.toString()}
      onScroll={scrollHandler}
      renderItem={() => <TripCardSkeleton />}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
      data={trips}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={
        <TripsListHeader
          activeFiltersCount={activeFiltersCount}
          clearFilters={clearFilters}
          filters={filters}
          setFilters={setFilters}
        />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      onScroll={scrollHandler}
      refreshing={isRefetching}
      renderItem={({ item }) => (
        <TripCard onPress={() => handleTripPress(item.id)} trip={item as unknown as UpcomingTrip} />
      )}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const TripsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const datePickerBottomSheetRef = useRef<BottomSheet>(null);

  const [range, setRange] = useState<{ startDate: DateType; endDate: DateType }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TripFilters>({
    status: undefined,
    dateFrom: null,
    dateTo: null,
    origin: '',
    destination: '',
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status) {
      count++;
    }
    if (filters.dateFrom || filters.dateTo) {
      count++;
    }
    if (filters.origin) {
      count++;
    }
    if (filters.destination) {
      count++;
    }
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({ status: undefined, dateFrom: null, dateTo: null, origin: '', destination: '' });
    setRange({ startDate: undefined, endDate: undefined });
    bottomSheetRef.current?.close();
  };

  const actions: ScreenAction[] = [
    {
      icon: Filter,
      onPress: () => bottomSheetRef.current?.expand(),
      type: 'icon',
    },
  ];

  return (
    <>
      <Screen actions={actions} padded={false} scrollable={false} title={t('screens.trips.title')}>
        {/* Sticky search bar */}
        <View style={styles.searchBar}>
          <Search color={Colors.SECONDARY} size={16} />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder={t('screens.trips.searchPlaceholder')}
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

        <TripsList
          activeFiltersCount={activeFiltersCount}
          clearFilters={clearFilters}
          filters={filters}
          handleTripPress={(id) => navigation.navigate('Trip', { tripId: id })}
          searchQuery={searchQuery}
          setFilters={setFilters}
          setSearchQuery={setSearchQuery}
        />
      </Screen>

      <Portal>
        <TripsFilterSheet
          filters={filters}
          onApply={() => bottomSheetRef.current?.close()}
          onClear={clearFilters}
          onFiltersChange={setFilters}
          onOpenDatePicker={() => datePickerBottomSheetRef.current?.expand()}
          ref={bottomSheetRef}
        />
        <DatePickerSheet
          onChange={setRange}
          onClear={() => {
            setRange({ startDate: undefined, endDate: undefined });
            setFilters((prev) => ({ ...prev, dateFrom: null, dateTo: null }));
          }}
          onConfirm={() => {
            setFilters((prev) => ({
              ...prev,
              dateFrom: range.startDate ? new Date(range.startDate as string | number | Date) : null,
              dateTo: range.endDate ? new Date(range.endDate as string | number | Date) : null,
            }));
            datePickerBottomSheetRef.current?.close();
          }}
          range={range}
          ref={datePickerBottomSheetRef}
        />
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.BACKGROUND,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
  },
  searchBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  activeFiltersContainer: {
    marginBottom: 16,
    backgroundColor: `${Colors.ACCENT_FOREGROUND}40`,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFiltersLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  clearAllText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.PRIMARY,
    textDecorationLine: 'underline',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.PRIMARY}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  quickFiltersContainer: {
    marginBottom: 16,
  },
  quickFiltersLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.ACCENT,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  quickFilterChipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.ACCENT,
  },

  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.ACCENT,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ACCENT,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  clearButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.BACKGROUND,
  },
});
