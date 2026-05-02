import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen, type ScreenAction } from '@repo/design-system/mobile/components/screen';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { Lock, LogOut, Mail, Phone, Save, User } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { Button, Divider, RadioButton, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { useAuth } from '@/contexts/auth-context';
import { useGetMe } from '@/features/me/api/use-get-me';
import { useUpdateMyProfile } from '@/features/me/api/use-update-me';
import i18n from '@/i18n';
import type { RootNav } from '@/navigation/root-navigator';

const storage = createMMKV();

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

const SettingsSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonText} />
    <View style={styles.skeletonText} />
    <View style={[styles.skeletonText, { width: '60%' }]} />
  </View>
);

const SectionLabel = ({ label }: { label: string }) => <Text style={styles.sectionLabel}>{label}</Text>;

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigation = useNavigation<RootNav>();

  const { data, isLoading } = useGetMe({}, { enabled: Boolean(auth.user) });
  const updateMe = useUpdateMyProfile();

  const [selectedLang, setSelectedLang] = useState<'en' | 'fr'>('en');

  const profileSchema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('screens.settings.firstNameRequired')),
        lastName: z.string().min(1, t('screens.settings.lastNameRequired')),
        phoneNumber: z.string().optional(),
      }),
    [t]
  );

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
    if (data?.data?.profile) {
      reset({
        firstName: data.data.profile.firstName || '',
        lastName: data.data.profile.lastName || '',
        phoneNumber: data.data.profile.phoneNumber || '',
      });
    }
  }, [data, reset]);

  useEffect(() => {
    const saved = storage.getString('language') || 'en';
    setSelectedLang(saved as 'en' | 'fr');
    i18n.changeLanguage(saved);
  }, []);

  const changeLanguage = (lng: 'en' | 'fr') => {
    setSelectedLang(lng);
    i18n.changeLanguage(lng);
    storage.set('language', lng);
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

  const profile = data?.data?.profile;
  const email = data?.data?.email;

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const fullName = profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : (email ?? '');

  const actions: ScreenAction[] | undefined =
    auth.user && data?.data
      ? [{ type: 'icon', icon: Save, onPress: handleSubmit(onSubmit), disabled: !isDirty }]
      : undefined;

  const isAuthenticated = !isLoading && !!auth.user && !!data?.data;

  return (
    <Screen actions={actions} title={t('screens.settings.title')}>
      {/* Loading */}
      {isLoading && <SettingsSkeleton />}

      {/* Guest */}
      {!(isLoading || auth.user) && (
        <View style={styles.guestContainer}>
          <View style={styles.guestIconWrap}>
            <User color={Colors.PRIMARY} size={32} />
          </View>
          <Text style={styles.guestTitle}>{t('screens.settings.notLoggedIn')}</Text>
          <Text style={styles.guestMessage}>{t('screens.settings.notLoggedInMessage')}</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.guestBtn}>
            {t('screens.settings.goToLogin')}
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('Register')} style={styles.guestBtn}>
            {t('screens.onboarding.signup')}
          </Button>
        </View>
      )}

      {/* Authenticated: avatar + profile form */}
      {isAuthenticated && (
        <>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.fullName}>{fullName}</Text>
            <Text style={styles.emailSubtitle}>{email}</Text>
          </View>

          <SectionLabel label={t('screens.settings.profile')} />
          <View style={styles.section}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    error={Boolean(errors.firstName)}
                    label={t('screens.settings.firstName')}
                    left={<TextInput.Icon icon={() => <User color={Colors.SECONDARY} size={18} />} />}
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
                <View>
                  <TextInput
                    error={Boolean(errors.lastName)}
                    label={t('screens.settings.lastName')}
                    left={<TextInput.Icon icon={() => <User color={Colors.SECONDARY} size={18} />} />}
                    mode="outlined"
                    onChangeText={onChange}
                    style={styles.input}
                    value={value}
                  />
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
                </View>
              )}
            />
            <Divider style={styles.divider} />
            <TextInput
              disabled
              label={t('screens.settings.email')}
              left={<TextInput.Icon icon={() => <Mail color={Colors.SECONDARY} size={18} />} />}
              mode="outlined"
              right={<TextInput.Icon icon={() => <Lock color={Colors.SECONDARY} size={16} />} />}
              style={styles.input}
              value={email}
            />
            <Text style={styles.helperText}>{t('screens.settings.emailNotEditable')}</Text>
            <TextInput
              disabled
              keyboardType="phone-pad"
              label={t('screens.settings.phone')}
              left={<TextInput.Icon icon={() => <Phone color={Colors.SECONDARY} size={18} />} />}
              mode="outlined"
              right={<TextInput.Icon icon={() => <Lock color={Colors.SECONDARY} size={16} />} />}
              style={styles.input}
              value={profile?.phoneNumber ?? ''}
            />
            <Text style={styles.helperText}>{t('screens.settings.phoneNotEditable')}</Text>
          </View>
        </>
      )}

      {/* Language — always visible */}
      <SectionLabel label={t('screens.settings.language')} />
      <View style={styles.section}>
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

      {/* Logout — authenticated only */}
      {auth.user && (
        <>
          <SectionLabel label={t('screens.settings.account')} />
          <Button
            icon={() => <LogOut color={Colors.DESTRUCTIVE} size={18} />}
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={Colors.DESTRUCTIVE}
          >
            {t('screens.settings.logout')}
          </Button>
        </>
      )}

      <View style={styles.bottomPad} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
    marginTop: 8,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    marginBottom: 8,
    width: 88,
  },
  avatarText: {
    color: Colors.BACKGROUND,
    fontFamily: Fonts.bold,
    fontSize: 32,
  },
  fullName: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  emailSubtitle: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 13,
  },

  sectionLabel: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  section: {
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  radioLabel: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },

  input: {
    backgroundColor: Colors.BACKGROUND,
  },
  helperText: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontStyle: 'italic',
    marginLeft: 4,
    marginTop: 2,
  },
  errorText: {
    color: Colors.DESTRUCTIVE,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  divider: {
    marginVertical: 4,
  },

  logoutButton: {
    borderColor: Colors.DESTRUCTIVE,
  },

  guestContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  guestIconWrap: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}18`,
    borderRadius: 40,
    height: 72,
    justifyContent: 'center',
    marginBottom: 8,
    width: 72,
  },
  guestTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  guestMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestBtn: {
    width: '100%',
  },

  bottomPad: {
    height: 32,
  },

  skeletonContainer: {
    marginBottom: 24,
  },
  skeletonTitle: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 24,
    marginBottom: 16,
    width: '40%',
  },
  skeletonText: {
    backgroundColor: Colors.CARD,
    borderRadius: 4,
    height: 16,
    marginBottom: 12,
    width: '100%',
  },
});
