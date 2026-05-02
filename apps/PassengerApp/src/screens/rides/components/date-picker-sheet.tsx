import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';

import { renderBackdrop } from '@/components/bottom-sheet/backdrop';
import i18n from '@/i18n';

type DatePickerSheetProps = {
  date: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onClear: () => void;
  ref: React.RefObject<BottomSheet | null>;
};

export const DatePickerSheet = ({ date, onChange, onConfirm, onClear, ref }: DatePickerSheetProps) => {
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
      backgroundStyle={styles.background}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      index={-1}
      ref={ref}
      snapPoints={['55%']}
    >
      <BottomSheetScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('screens.rides.select_date')}</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearText}>{t('common.clear')}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          date={date}
          locale={i18n.language}
          minDate={new Date()}
          mode="single"
          onChange={({ date: d }) => {
            if (d) {
              onChange(dayjs(d).toDate());
            }
          }}
          styles={pickerStyles}
        />

        <Button mode="contained" onPress={onConfirm} style={styles.confirmBtn}>
          {t('common.confirm')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_FOREGROUND,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
  },
  clearText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  confirmBtn: {
    marginTop: 20,
  },
});
