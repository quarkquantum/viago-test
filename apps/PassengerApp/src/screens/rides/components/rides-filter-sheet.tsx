import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { Calendar, ChevronRight, MapPin, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { renderBackdrop } from '@/components/bottom-sheet/backdrop';

export type RideFilters = {
  from: string;
  to: string;
  date: Date;
};

type RidesFilterSheetProps = {
  filters: RideFilters;
  onFiltersChange: (filters: RideFilters) => void;
  onClear: () => void;
  onApply: () => void;
  onOpenDatePicker: () => void;
  ref: React.RefObject<BottomSheet | null>;
};

export const RidesFilterSheet = ({
  filters,
  onFiltersChange,
  onClear,
  onApply,
  onOpenDatePicker,
  ref,
}: RidesFilterSheetProps) => {
  const { t } = useTranslation();

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      index={-1}
      ref={ref}
      snapPoints={['60%']}
    >
      <BottomSheetScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t('screens.rides.filters')}</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearAllText}>{t('common.clear_all')}</Text>
          </TouchableOpacity>
        </View>

        {/* Route Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.route')}</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color={Colors.PRIMARY} size={20} />
            </View>
            <TextInput
              onChangeText={(text) => onFiltersChange({ ...filters, from: text })}
              placeholder={t('common.from')}
              placeholderTextColor={Colors.SECONDARY}
              style={styles.filterInput}
              value={filters.from}
            />
            {filters.from.length > 0 && (
              <TouchableOpacity onPress={() => onFiltersChange({ ...filters, from: '' })}>
                <X color={Colors.ACCENT} size={18} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color={Colors.SECONDARY} size={20} />
            </View>
            <TextInput
              onChangeText={(text) => onFiltersChange({ ...filters, to: text })}
              placeholder={t('common.to')}
              placeholderTextColor={Colors.SECONDARY}
              style={styles.filterInput}
              value={filters.to}
            />
            {filters.to.length > 0 && (
              <TouchableOpacity onPress={() => onFiltersChange({ ...filters, to: '' })}>
                <X color={Colors.ACCENT} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.selectTravelDate')}</Text>
          <TouchableOpacity onPress={onOpenDatePicker} style={styles.dateCard}>
            <View style={styles.dateCardContent}>
              <Calendar color={Colors.PRIMARY} size={20} />
              <Text style={styles.dateCardText}>{dayjs(filters.date).format('DD MMM YYYY')}</Text>
            </View>
            <ChevronRight color={Colors.ACCENT} size={20} />
          </TouchableOpacity>
        </View>

        <Button mode="contained" onPress={onApply} style={styles.applyBtn}>
          {t('common.apply_filters')}
        </Button>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.BACKGROUND,
  },
  indicator: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
  },
  content: {
    paddingHorizontal: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_FOREGROUND,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  clearAllText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.ACCENT,
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
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
    fontSize: 15,
    color: Colors.ACCENT,
    padding: 0,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
  },
  dateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateCardText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.ACCENT,
  },
  applyBtn: {
    marginTop: 4,
  },
});
