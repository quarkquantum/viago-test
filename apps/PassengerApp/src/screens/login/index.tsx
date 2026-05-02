import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Colors } from '@repo/shared';
import { Eye, EyeOff, LockIcon, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import type { RootNav } from '@/navigation/root-navigator';
import { getAuthErrorMessage } from '@/utils/auth-errors';
import { styles } from './styles';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation<RootNav>();
  const auth = useAuth();

  const loginSchema = z.object({
    email: z.email(t('screens.login.emailRequired')).min(1, t('screens.login.emailMinLength')),
    password: z
      .string(t('screens.login.passwordRequired'))
      .min(8, t('screens.login.passwordMinLength'))
      .max(32, t('screens.login.passwordMaxLength')),
  });

  type FormValues = z.infer<typeof loginSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await auth.login({ email: data.email.toLowerCase(), password: data.password });
      toast.success(t('screens.login.success'));
      nav.navigate('MainTabs');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen back contentContainerStyle={{ justifyContent: 'center' }} title={t('screens.login.title')}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.heading}>{t('screens.login.heading')}</Text>
        <Text style={styles.subtitle}>{t('screens.login.subtitle')}</Text>
      </View>

      <Text style={styles.label}>{t('screens.login.emailLabel')}</Text>
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
            placeholder={t('screens.login.emailPlaceholder')}
            style={styles.input}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Text style={styles.label}>{t('screens.login.passwordLabel')}</Text>
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
            placeholder={t('screens.login.passwordPlaceholder')}
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

      <View style={styles.links}>
        <Button mode="text" textColor={Colors.TEXT}>
          {t('screens.login.forgotPassword')}
        </Button>
      </View>

      <Button disabled={loading} loading={loading} mode="contained" onPress={handleSubmit(onSubmit)}>
        {t('screens.login.loginButton')}
      </Button>

      <Button disabled={loading} mode="text" onPress={() => nav.navigate('Register')}>
        {t('screens.login.noAccount')}
      </Button>
    </Screen>
  );
};
