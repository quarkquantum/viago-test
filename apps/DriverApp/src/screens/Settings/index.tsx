import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { LogOut, Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { storage, StorageKeys } from '@/lib/storage';
import { Button, Card, Divider, RadioButton, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useGetMe } from '@/features/me/api/use-get-me';
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

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigation = useNavigation<RootNav>();

  const { data, isLoading } = useGetMe({
    enabled: Boolean(auth.user),
  });
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
    await updateMe.mutateAsync(formData);
    reset(formData);
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
          <Text style={styles.sectionTitle}>{t('screens.settings.profile')}</Text>
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
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('screens.settings.email')}</Text>
              <TextInput disabled mode="outlined" style={styles.input} value={data.email} />
              <Text style={styles.helperText}>{t('screens.settings.emailNotEditable')}</Text>
            </View>
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
