import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { Building2, Calendar, LogOut, Save, Star, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { storage, StorageKeys } from '@/lib/storage';
import { Avatar, Button, Card, Divider, RadioButton, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useGetMe } from '@/features/me/api/use-get-me';
import { useGetStats } from '@/features/me/api/use-get-stats';
import { useUpdateMyProfile } from '@/features/me/api/use-update-me';
import i18n from '@/i18n';
import type { RootNav } from '@/navigation/RootNavigator';
import { SettingsSkeleton } from './Skeleton';
import styles from './styles';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

export const MyProfileScreen = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigation = useNavigation<RootNav>();

  const { data, isLoading } = useGetMe({ enabled: Boolean(auth.user) });
  const { data: stats } = useGetStats({ enabled: Boolean(auth.user) });
  const updateMe = useUpdateMyProfile();

  const [selectedLang, setSelectedLang] = useState<'en' | 'fr'>('en');

  const profileSchema = z.object({
    firstName: z.string().min(1, t('screens.settings.firstNameRequired')),
    lastName: z.string().min(1, t('screens.settings.lastNameRequired')),
    phoneNumber: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: { firstName: '', lastName: '', phoneNumber: '' },
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (data?.profile) {
      reset({
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        phoneNumber: data.profile.phoneNumber || '',
      });
    }
  }, [data, reset]);

  useEffect(() => {
    const saved = storage.getString(StorageKeys.LANGUAGE) || 'en';
    setSelectedLang(saved as 'en' | 'fr');
    i18n.changeLanguage(saved);
  }, []);

  const changeLanguage = (lng: 'en' | 'fr') => {
    setSelectedLang(lng);
    i18n.changeLanguage(lng);
    storage.set(StorageKeys.LANGUAGE, lng);
  };

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      await updateMe.mutateAsync(formData);
      reset(formData);
      toast.success(t('screens.settings.updateSuccess'));
    } catch (_error) {
      toast.error(t('screens.settings.updateFailed'));
    }
  };

  const handleLogout = () => {
    Alert.alert(t('screens.settings.logoutConfirmTitle'), t('screens.settings.logoutConfirmMessage'), [
      { style: 'cancel', text: t('common.cancel') },
      {
        onPress: async () => {
          try {
            await auth.logout();
            toast.success(t('screens.settings.loggedOut'));
            navigation.navigate('MainTabs');
          } catch {
            toast.error(t('screens.settings.logoutFailed'));
          }
        },
        style: 'destructive',
        text: t('screens.settings.logout'),
      },
    ]);
  };

  const agencyData = data?.agencyMemberships?.[0];
  const userInitials = `${data?.profile?.firstName?.[0] || ''}${data?.profile?.lastName?.[0] || ''}`.toUpperCase();

  const actions: ScreenAction[] | undefined =
    auth.user && data ? [{ disabled: !isDirty, icon: Save, onPress: handleSubmit(onSubmit), type: 'icon' }] : undefined;

  return (
    <Screen actions={actions} title={t('screens.settings.title')}>
      {isLoading && <SettingsSkeleton />}

      {!(isLoading || auth.user) && (
        <Card style={styles.notLoggedInCard}>
          <Card.Content>
            <Text style={styles.notLoggedInTitle} variant="titleMedium">
              {t('screens.settings.notLoggedIn')}
            </Text>
            <Text style={styles.notLoggedInText} variant="bodyMedium">
              {t('screens.settings.notLoggedInMessage')}
            </Text>
            <Button mode="contained" onPress={() => navigation.navigate('Login')}>
              {t('screens.settings.goToLogin')}
            </Button>
          </Card.Content>
        </Card>
      )}

      {!isLoading && auth.user && data && (
        <View style={styles.userSection}>
          {/* Header with Avatar */}
          <View style={styles.header}>
            <Avatar.Text label={userInitials || 'D'} labelStyle={styles.avatarText} size={70} style={styles.avatar} />
            <Text style={styles.userName}>{`${data.profile?.firstName} ${data.profile?.lastName}`}</Text>
            <Text style={styles.userEmail}>{data.email}</Text>
            <View style={styles.joinedContainer}>
              <Calendar color={Colors.SECONDARY} size={14} />
              <Text style={styles.joinedText}>
                {t('screens.settings.joinedOn', { date: dayjs(data.createdAt).format('MMMM YYYY') })}
              </Text>
            </View>
          </View>

          {/* Agency Info */}
          {agencyData && (
            <View style={styles.agencySection}>
              <View style={styles.agencyHeader}>
                <Building2 color={Colors.PRIMARY} size={18} />
                <Text style={styles.agencyName}>{agencyData.agency.name}</Text>
              </View>
              {agencyData.agency.description && (
                <Text style={styles.agencyDescription}>{agencyData.agency.description}</Text>
              )}
              <View style={styles.joinedContainer}>
                <Calendar color={Colors.SECONDARY} size={12} />
                <Text style={styles.joinedText}>
                  {t('screens.settings.driverSince', {
                    date: dayjs(agencyData.createdAt).format('DD MMMM YYYY'),
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* Statistics Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>{t('screens.trips.stats_title')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <TrendingUp color={Colors.PRIMARY} size={20} />
                <Text style={styles.statValue}>{stats?.totalTrips ?? 0}</Text>
                <Text style={styles.statLabel}>{t('screens.trips.stats_total')}</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar color={Colors.SECONDARY} size={20} />
                <Text style={styles.statValue}>{stats?.upcomingTrips ?? 0}</Text>
                <Text style={styles.statLabel}>{t('screens.trips.upcoming_trips')}</Text>
              </View>
              <View style={styles.statCard}>
                <Star color={Colors.ACCENT} size={20} />
                <Text style={styles.statValue}>{data?.rating?.toFixed(1) ?? '0.0'}</Text>
                <Text style={styles.statLabel}>
                  {t('screens.trips.reviews_count', { count: data?.reviewCount ?? 0 })}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t('screens.settings.profileDetails')}</Text>
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('screens.settings.firstName')}</Text>
                  <TextInput
                    error={Boolean(errors.firstName)}
                    mode="outlined"
                    onChangeText={onChange}
                    style={styles.input}
                    value={value}
                  />
                  {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('screens.settings.lastName')}</Text>
                  <TextInput
                    error={Boolean(errors.lastName)}
                    mode="outlined"
                    onChangeText={onChange}
                    style={styles.input}
                    value={value}
                  />
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('screens.settings.phone')}</Text>
                  <TextInput
                    disabled
                    keyboardType="phone-pad"
                    mode="outlined"
                    onChangeText={onChange}
                    style={styles.input}
                    value={value}
                  />
                  <Text style={styles.helperText}>{t('screens.settings.phoneNotEditable')}</Text>
                </View>
              )}
            />
          </View>
        </View>
      )}

      {/* Language selector - always visible */}
      <Text style={styles.sectionTitle}>{t('screens.settings.language')}</Text>
      <View style={styles.radioGroup}>
        <RadioButton.Item
          color={Colors.PRIMARY}
          label="English"
          labelStyle={styles.radioLabel}
          mode="android"
          onPress={() => changeLanguage('en')}
          status={selectedLang === 'en' ? 'checked' : 'unchecked'}
          value="en"
        />
        <Divider />
        <RadioButton.Item
          color={Colors.PRIMARY}
          label="Français"
          labelStyle={styles.radioLabel}
          mode="android"
          onPress={() => changeLanguage('fr')}
          status={selectedLang === 'fr' ? 'checked' : 'unchecked'}
          value="fr"
        />
      </View>

      {auth.user && (
        <View style={styles.logoutSection}>
          <Button
            icon={() => <LogOut color={Colors.DESTRUCTIVE} size={18} />}
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={Colors.DESTRUCTIVE}
          >
            {t('screens.settings.logout')}
          </Button>
        </View>
      )}
    </Screen>
  );
};
