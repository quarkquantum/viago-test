import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors, TripStatus } from '@repo/shared';
import { Calendar, ChevronRight, MapPin, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { renderBackdrop } from '@/components/bottom-sheet/backdrop';

export type TripFilters = {
  status: TripStatus | undefined;
  dateFrom: Date | null;
  dateTo: Date | null;
  origin: string;
  destination: string;
};

type TripsFilterSheetProps = {
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
  onClear: () => void;
  onApply: () => void;
  onOpenDatePicker: () => void;
  // React 19: ref is safe to rely on props if passed as such, or use a custom prop name if strict standard
  // But usually libraries pass it as 'ref'.
  ref: React.RefObject<BottomSheet | null>;
};

export const TripsFilterSheet = ({
  filters,
  onFiltersChange,
  onClear,
  onApply,
  onOpenDatePicker,
  ref,
}: TripsFilterSheetProps) => {
  const { t } = useTranslation();

  const handleStatusToggle = (status: TripStatus) => {
    onFiltersChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      enablePanDownToClose
      handleIndicatorStyle={styles.bottomSheetIndicator}
      index={-1}
      ref={ref}
      snapPoints={['70%']}
    >
      <BottomSheetScrollView style={styles.bottomSheetContent}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>{t('screens.trips.filters')}</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearFiltersText}>{t('common.clear_all')}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>{t('screens.trips.status')}</Text>
          <View style={styles.statusGrid}>
            {[TripStatus.PENDING, TripStatus.COMPLETED].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleStatusToggle(status)}
                style={[styles.statusChip, filters.status === status && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, filters.status === status && styles.statusChipTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>{t('screens.trips.locations')}</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color={Colors.PRIMARY} size={20} />
            </View>
            <TextInput
              onChangeText={(text) => onFiltersChange({ ...filters, origin: text })}
              placeholder={t('screens.trips.origin_placeholder')}
              placeholderTextColor={Colors.ACCENT}
              style={styles.filterInput}
              value={filters.origin}
            />
            {filters.origin.length > 0 && (
              <TouchableOpacity onPress={() => onFiltersChange({ ...filters, origin: '' })}>
                <X color={Colors.ACCENT} size={20} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color={Colors.SECONDARY} size={20} />
            </View>
            <TextInput
              onChangeText={(text) => onFiltersChange({ ...filters, destination: text })}
              placeholder={t('screens.trips.destination_placeholder')}
              placeholderTextColor={Colors.ACCENT}
              style={styles.filterInput}
              value={filters.destination}
            />
            {filters.destination.length > 0 && (
              <TouchableOpacity onPress={() => onFiltersChange({ ...filters, destination: '' })}>
                <X color={Colors.ACCENT} size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Date Range Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>{t('screens.trips.date_range')}</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={onOpenDatePicker} style={styles.dateRangeCard}>
              <View style={styles.dateRangeContent}>
                <Calendar color={Colors.PRIMARY} size={20} />
                <Text style={styles.dateButtonText}>
                  {filters.dateFrom && filters.dateTo
                    ? `${filters.dateFrom.toLocaleDateString()} - ${filters.dateTo.toLocaleDateString()}`
                    : t('screens.trips.select_date_range')}
                </Text>
              </View>
              <ChevronRight color={Colors.ACCENT} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Apply Button */}
        <Button mode="contained" onPress={onApply}>
          {t('common.apply_filters')}
        </Button>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.BACKGROUND,
  },
  bottomSheetIndicator: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_FOREGROUND,
  },
  filterTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  clearFiltersText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.ACCENT,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  statusChipActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  statusChipText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  statusChipTextActive: {
    color: Colors.BACKGROUND,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
    gap: 12,
  },
  inputIcon: {
    width: 24,
    alignItems: 'center',
  },
  filterInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ACCENT,
    padding: 0,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateRangeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${Colors.ACCENT_FOREGROUND}80`,
    // Shadow for elegance
    shadowColor: Colors.ACCENT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateRangeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ACCENT,
  },
});
