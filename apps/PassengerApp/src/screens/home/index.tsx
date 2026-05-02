import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { Bell, Calendar as CalendarIcon, MapPin, Navigation, Search } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import DateTimePicker from 'react-native-ui-datepicker';
import { RouteCard } from '@/components/route-card';
import { styles } from './styles';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { useAuth } from '@/contexts/auth-context';
import { useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';
import type { RootNav } from '@/navigation/root-navigator';

type FormData = {
  from?: string;
  to?: string;
  date: dayjs.Dayjs;
};

export const HomeScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
    ),
    []
  );

  const { data, isLoading } = useListTripsRoutes();

  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      date: dayjs(),
      from: '',
      to: '',
    },
  });

  const selectedDate = watch('date');
  const formatDate = (d: dayjs.Dayjs) => d.format('dddd MMM DD, YYYY');

  const onSubmit = (_data: FormData) => {
    handleCloseModalPress();
    navigation.navigate('MainTabs', {
      params: {
        date: _data.date.toISOString(),
        from: _data.from,
        to: _data.to,
      },
      screen: 'Rides',
    });
  };

  const firstName = user?.name?.split(' ')[0];
  const routes = data?.data?.filter((item): item is NonNullable<typeof item> => item != null) ?? [];

  return (
    <Screen
      actions={[{ type: 'icon', icon: Bell, onPress: () => navigation.navigate('Notifications') }]}
      title={t('screens.home.title')}
    >
      {/* ─── GREETING ─── */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>
          {firstName ? t('screens.home.greeting', { name: firstName }) : t('screens.home.welcome')}
        </Text>
        <Text style={styles.greetingSubtext}>{t('screens.home.subtitle')}</Text>
      </View>

      {/* ─── SEARCH PILL ─── */}
      <Pressable
        onPress={handlePresentModalPress}
        style={({ pressed }) => [styles.searchTrigger, pressed && styles.searchTriggerPressed]}
      >
        <View style={styles.searchIconContainer}>
          <Search color={Colors.PRIMARY} size={20} strokeWidth={2.5} />
        </View>
        <View style={styles.searchTriggerTextContent}>
          <Text style={styles.searchTriggerTitle}>{t('screens.home.whereToGo')}</Text>
          <View style={styles.searchTriggerSubRow}>
            <Text style={styles.searchTriggerSub}>{t('screens.home.anyRoute')}</Text>
            <View style={styles.dot} />
            <Text style={styles.searchTriggerSub}>{t('screens.home.anyDate')}</Text>
          </View>
        </View>
      </Pressable>

      {/* ─── QUICK ACTIONS ─── */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Rides', params: {} })}
          style={styles.actionCard}
        >
          <View style={[styles.actionIconArea, { backgroundColor: `${Colors.PRIMARY}15` }]}>
            <MapPin color={Colors.PRIMARY} size={24} />
          </View>
          <Text style={styles.actionText}>{t('screens.home.nearby')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MainTabs', { screen: 'MyTickets' })}
          style={styles.actionCard}
        >
          <View style={[styles.actionIconArea, { backgroundColor: `${Colors.WARNING}15` }]}>
            <CalendarIcon color={Colors.WARNING} size={24} />
          </View>
          <Text style={styles.actionText}>{t('screens.home.myTrips')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.actionCard}
        >
          <View style={[styles.actionIconArea, { backgroundColor: `${Colors.SECONDARY}15` }]}>
            <Bell color={Colors.SECONDARY} size={24} />
          </View>
          <Text style={styles.actionText}>{t('screens.home.alerts')}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── POPULAR RIDES ─── */}
      <View style={styles.ridesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('screens.home.availableRides')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Rides', params: {} })}>
            <Text style={styles.seeAllText}>{t('common.seeMore')}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator color={Colors.PRIMARY} size="small" />
          </View>
        )}

        {!isLoading && routes.length === 0 && (
          <View style={styles.stateContainer}>
            <Search color={`${Colors.ACCENT}30`} size={40} />
            <Text style={styles.emptyTitle}>{t('screens.home.noRides')}</Text>
            <Text style={styles.emptyMessage}>{t('screens.home.noRidesMessage')}</Text>
          </View>
        )}

        {!isLoading && routes.length > 0 && (
          <View style={styles.ridesList}>
            {routes.map((item) => (
              <RouteCard key={item.trip.id} route={item} />
            ))}
          </View>
        )}
      </View>

      {/* ─── BOTTOM SHEET: SEARCH FILTERS ─── */}
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
        handleIndicatorStyle={styles.sheetIndicator}
        index={0}
        ref={bottomSheetModalRef}
        snapPoints={['70%']}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>{t('screens.home.findRide')}</Text>

          <View style={styles.sheetForm}>
            {/* From */}
            <Controller
              control={control}
              name="from"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('screens.home.departure')}</Text>
                  <TextInput
                    error={Boolean(error)}
                    left={<TextInput.Icon icon={() => <MapPin color={Colors.ACCENT} size={18} />} />}
                    mode="outlined"
                    onChangeText={onChange}
                    outlineStyle={styles.sheetInputOutline}
                    placeholder={t('screens.home.cityOrStation')}
                    style={styles.sheetInput}
                    value={value}
                  />
                </View>
              )}
            />

            {/* To */}
            <Controller
              control={control}
              name="to"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('screens.home.destination')}</Text>
                  <TextInput
                    error={Boolean(error)}
                    left={<TextInput.Icon icon={() => <Navigation color={Colors.ACCENT} size={18} />} />}
                    mode="outlined"
                    onChangeText={onChange}
                    outlineStyle={styles.sheetInputOutline}
                    placeholder={t('screens.home.cityOrStation')}
                    style={styles.sheetInput}
                    value={value}
                  />
                </View>
              )}
            />

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('screens.home.date')}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setDateMenuOpen(!dateMenuOpen)}>
                <TextInput
                  editable={false}
                  left={<TextInput.Icon icon={() => <CalendarIcon color={Colors.ACCENT} size={18} />} />}
                  mode="outlined"
                  outlineStyle={styles.sheetInputOutline}
                  placeholder={t('common.selectTravelDate')}
                  pointerEvents="none"
                  style={styles.sheetInput}
                  value={formatDate(selectedDate)}
                />
              </TouchableOpacity>

              {dateMenuOpen && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    date={selectedDate.toDate()}
                    minDate={new Date()}
                    mode="single"
                    onChange={({ date }) => {
                      setValue('date', dayjs(date));
                      setDateMenuOpen(false);
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Submit */}
          <Button
            contentStyle={styles.submitBtnContent}
            icon={() => <Search color={Colors.BACKGROUND} size={20} />}
            labelStyle={styles.submitBtnLabel}
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          >
            {t('screens.home.searchBuses')}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </Screen>
  );
};
