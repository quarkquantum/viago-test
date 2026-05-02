import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import DateTimePicker, { type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { renderBackdrop } from '@/components/bottom-sheet/backdrop';
import i18n from '@/i18n';

type DatePickerSheetProps = {
  range: { startDate: DateType; endDate: DateType };
  onChange: (range: { startDate: DateType; endDate: DateType }) => void;
  onConfirm: () => void;
  onClear: () => void;
  ref: React.RefObject<BottomSheet | null>;
};

export const DatePickerSheet = ({ range, onChange, onConfirm, onClear, ref }: DatePickerSheetProps) => {
  const { t } = useTranslation();
  const defaultStyles = useDefaultStyles();

  const pickerStyles = useMemo(
    () => ({
      ...defaultStyles,
      day_label: { color: Colors.TEXT, fontFamily: Fonts.medium },
      year_selector: { color: Colors.TEXT, fontFamily: Fonts.medium },
      month_selector: { color: Colors.TEXT, fontFamily: Fonts.medium },
      month_label: { color: Colors.TEXT, fontFamily: Fonts.medium },
      month_selector_label: { color: Colors.TEXT, fontFamily: Fonts.medium },
      year_selector_label: { color: Colors.TEXT, fontFamily: Fonts.medium },
      year_label: { color: Colors.TEXT, fontFamily: Fonts.medium },
      month: { backgroundColor: Colors.ACCENT_FOREGROUND, borderRadius: 12, fontFamily: Fonts.medium },
      selected_month: { backgroundColor: Colors.PRIMARY },
      year: { backgroundColor: Colors.ACCENT_FOREGROUND, borderRadius: 12, fontFamily: Fonts.medium },
      selected_year: { backgroundColor: Colors.PRIMARY },
      today: { borderColor: Colors.PRIMARY, borderWidth: 1.5 },
      selected: { backgroundColor: Colors.PRIMARY },
      selected_label: { color: Colors.BACKGROUND },
    }),
    [defaultStyles]
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      enablePanDownToClose
      handleIndicatorStyle={styles.bottomSheetIndicator}
      index={-1}
      ref={ref}
      snapPoints={['60%']}
    >
      <BottomSheetScrollView style={styles.bottomSheetContent}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>{t('screens.trips.select_dates')}</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearFiltersText}>{t('common.clear')}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          endDate={range.endDate}
          locale={i18n.language}
          mode="range"
          onChange={({ startDate, endDate }) => onChange({ startDate, endDate })}
          startDate={range.startDate}
          styles={pickerStyles}
        />

        <Button mode="contained" onPress={onConfirm} style={styles.confirmButton}>
          {t('common.confirm')}
        </Button>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  confirmButton: {
    marginTop: 20,
  },
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
});
