import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { Eye, EyeOff, LockIcon, Mail, Phone, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Button, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { useAuth } from '@/contexts/auth-context';
import type { RootNav } from '@/navigation/root-navigator';
import { getAuthErrorMessage } from '@/utils/auth-errors';
import { styles } from './styles';

export const RegisterScreen = () => {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const nav = useNavigation<RootNav>();
  const auth = useAuth();

  const registerSchema = z
    .object({
      confirmPassword: z.string(),
      email: z.email(t('screens.register.emailRequired')).min(1, t('screens.register.emailMinLength')),
      firstName: z
        .string()
        .min(1, t('screens.register.firstNameRequired'))
        .max(32, t('screens.register.firstNameMaxLength')),
      lastName: z
        .string()
        .min(1, t('screens.register.lastNameRequired'))
        .max(32, t('screens.register.lastNameMaxLength')),
      password: z
        .string(t('screens.register.passwordRequired'))
        .min(8, t('screens.register.passwordMinLength'))
        .max(32, t('screens.register.passwordMaxLength')),
      phoneNumber: z.string().min(1, t('screens.register.phoneNumberMinLength')).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('screens.register.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  type FormValues = z.infer<typeof registerSchema>;

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      phoneNumber: '',
    },
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
  });

  const handleNext = async (step: number) => {
    let isValid = false;
    if (step === 0) {
      isValid = await trigger(['firstName', 'lastName']);
    } else if (step === 1) {
      isValid = await trigger(['email', 'phoneNumber']);
    }

    if (isValid) {
      pagerRef.current?.setPage(step + 1);
      setCurrentPage(step + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
      setCurrentPage(currentPage - 1);
    } else {
      nav.goBack();
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await auth.register({
        email: data.email.toLowerCase(),
        firstname: data.firstName,
        lastname: data.lastName,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });
      toast.success(t('screens.register.success'));
      nav.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen back contentContainerStyle={{ justifyContent: 'center' }} title={t('screens.register.title')}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.heading}>{t('screens.register.heading')}</Text>
        <Text style={styles.subtitle}>{t('screens.register.subtitle')}</Text>
      </View>

      <PagerView
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        ref={pagerRef}
        scrollEnabled={false}
        style={styles.pagerView}
      >
        {/* Step 1: Names */}
        <View key="1" style={styles.page}>
          <Text style={styles.label}>{t('screens.register.firstNameLabel')}</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                left={<TextInput.Icon icon={() => <User color={Colors.ACCENT} size={24} />} />}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.firstNamePlaceholder')}
                style={styles.input}
              />
            )}
          />
          {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}

          <Text style={styles.label}>{t('screens.register.lastNameLabel')}</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.lastNamePlaceholder')}
                style={styles.input}
              />
            )}
          />
          {errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}

          <View style={styles.buttonRow}>
            <Button mode="text" onPress={() => nav.navigate('Login')} style={styles.navButton}>
              {t('screens.register.alreadyAccount')}
            </Button>
            <Button mode="contained" onPress={() => handleNext(0)} style={styles.navButton}>
              {t('common.next')}
            </Button>
          </View>
        </View>

        {/* Step 2: Email & Phone */}
        <View key="2" style={styles.page}>
          <Text style={styles.label}>{t('screens.register.emailLabel')}</Text>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                keyboardType="email-address"
                left={<TextInput.Icon icon={() => <Mail color={Colors.ACCENT} size={24} />} />}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.emailPlaceholder')}
                style={styles.input}
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Text style={styles.label}>{t('screens.register.phoneNumberLabel')}</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon={() => <Phone color={Colors.ACCENT} size={24} />} />}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.phoneNumberPlaceholder')}
                style={styles.input}
              />
            )}
          />
          {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber.message}</Text>}

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={handleBack} style={styles.navButton}>
              {t('common.back')}
            </Button>
            <Button mode="contained" onPress={() => handleNext(1)} style={styles.navButton}>
              {t('common.next')}
            </Button>
          </View>
        </View>

        {/* Step 3: Passwords */}
        <View key="3" style={styles.page}>
          <Text style={styles.label}>{t('screens.register.passwordLabel')}</Text>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                left={<TextInput.Icon icon={() => <LockIcon color={Colors.ACCENT} size={24} />} />}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.passwordPlaceholder')}
                right={
                  <TextInput.Icon
                    icon={() =>
                      isPasswordVisible ? (
                        <Eye color={Colors.ACCENT} size={24} />
                      ) : (
                        <EyeOff color={Colors.ACCENT} size={24} />
                      )
                    }
                    onPress={() => setIsPasswordVisible((v) => !v)}
                  />
                }
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <Text style={styles.label}>{t('screens.register.confirmPasswordLabel')}</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextInput
                {...field}
                disabled={loading}
                left={<TextInput.Icon icon={() => <LockIcon color={Colors.ACCENT} size={24} />} />}
                mode="outlined"
                onChangeText={field.onChange}
                placeholder={t('screens.register.confirmPasswordPlaceholder')}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
              />
            )}
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

          <View style={styles.buttonRow}>
            <Button disabled={loading} mode="outlined" onPress={handleBack} style={styles.navButton}>
              {t('common.back')}
            </Button>
            <Button
              disabled={loading}
              loading={loading}
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.navButton}
            >
              {t('screens.register.registerButton')}
            </Button>
          </View>
        </View>
      </PagerView>
    </Screen>
  );
};
