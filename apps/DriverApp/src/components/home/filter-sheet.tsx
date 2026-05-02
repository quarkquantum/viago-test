import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import DatePicker from 'react-native-date-picker';
import { Button, SegmentedButtons, Text } from 'react-native-paper';

export type TripFilters = {
  sortBy?: 'departureTime' | 'arrivalTime';
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
  fromStation?: string;
  toStation?: string;
};

type Props = {
  filters: TripFilters;
  onApply: (filters: TripFilters) => void;
  onClose: () => void;
  visible: boolean;
};

export const FilterSheet = ({ filters, onApply, onClose, visible }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const [localFilters, setLocalFilters] = useState<TripFilters>(filters);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  // Sync props to local state when opening
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: TripFilters = {
      sortBy: 'departureTime',
      sortOrder: 'asc',
      startDate: undefined,
      endDate: undefined,
      fromStation: undefined,
      toStation: undefined,
    };
    setLocalFilters(resetFilters);
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    []
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      enablePanDownToClose
      handleIndicatorStyle={styles.bottomSheetIndicator}
      index={-1}
      onClose={onClose}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Trips</Text>
          <Button onPress={handleReset}>Reset</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <SegmentedButtons
            buttons={[
              { value: 'departureTime', label: 'Departure' },
              { value: 'arrivalTime', label: 'Arrival' },
            ]}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, sortBy: value as 'departureTime' | 'arrivalTime' })
            }
            style={styles.segmentedButton}
            value={localFilters.sortBy || 'departureTime'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort Order</Text>
          <SegmentedButtons
            buttons={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]}
            onValueChange={(value) => setLocalFilters({ ...localFilters, sortOrder: value as 'asc' | 'desc' })}
            style={styles.segmentedButton}
            value={localFilters.sortOrder || 'asc'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stations</Text>
          <BottomSheetTextInput
            onChangeText={(text) => setLocalFilters({ ...localFilters, fromStation: text })}
            placeholder="From Station"
            placeholderTextColor={Colors.SECONDARY}
            style={styles.input}
            value={localFilters.fromStation}
          />
          <View style={styles.spacerV} />
          <BottomSheetTextInput
            onChangeText={(text) => setLocalFilters({ ...localFilters, toStation: text })}
            placeholder="To Station"
            placeholderTextColor={Colors.SECONDARY}
            style={styles.input}
            value={localFilters.toStation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <TouchableOpacity onPress={() => setOpenStart(true)} style={styles.dateInput}>
                <Text style={localFilters.startDate ? styles.dateTextFilled : styles.dateTextPlaceholder}>
                  {localFilters.startDate ? dayjs(localFilters.startDate).format('DD MMM YYYY') : 'Start Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.spacerH} />
            <View style={styles.flex}>
              <TouchableOpacity onPress={() => setOpenEnd(true)} style={styles.dateInput}>
                <Text style={localFilters.endDate ? styles.dateTextFilled : styles.dateTextPlaceholder}>
                  {localFilters.endDate ? dayjs(localFilters.endDate).format('DD MMM YYYY') : 'End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button mode="contained" onPress={handleApply} style={styles.applyButton}>
          Apply Filters
        </Button>
        <View style={styles.bottomSpacer} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.BACKGROUND,
  },
  bottomSheetIndicator: {
    backgroundColor: Colors.SECONDARY,
  },
  spacerV: {
    height: 12,
  },
  spacerH: {
    width: 12,
  },
  bottomSpacer: {
    height: 40,
  },
  flex: {
    flex: 1,
  },
  dateTextFilled: {
    color: Colors.TEXT,
  },
  dateTextPlaceholder: {
    color: Colors.SECONDARY,
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.TEXT,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ACCENT,
    marginBottom: 12,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    fontSize: 16,
    backgroundColor: Colors.BACKGROUND,
  },
  dateInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: Colors.BACKGROUND,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  applyButton: {
    marginTop: 12,
    backgroundColor: Colors.PRIMARY,
  },
});
