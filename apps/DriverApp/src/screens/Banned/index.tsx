import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { AlertCircle, LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { ViewContainer } from '@/components/view-container';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  banReason?: string | null;
  banExpires?: string | Date | null;
};

export const BannedScreen = ({ banReason, banExpires }: Props) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const expiryDate = banExpires ? dayjs(banExpires).format('DD MMMM YYYY') : null;

  return (
    <ViewContainer style={styles.container}>
      <Surface elevation={2} style={styles.card}>
        <View style={styles.iconContainer}>
          <AlertCircle color={Colors.DESTRUCTIVE} size={64} />
        </View>

        <Text style={styles.title} variant="headlineMedium">
          {t('screens.settings.banned.title')}
        </Text>

        <Text style={styles.description} variant="bodyLarge">
          {t('screens.settings.banned.description')}
        </Text>

        {(banReason || expiryDate) && (
          <View style={styles.infoSection}>
            {banReason && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('screens.settings.banned.reason')}:</Text>
                <Text style={styles.infoValue}>{banReason}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('screens.settings.banned.expires')}:</Text>
              <Text style={styles.infoValue}>{expiryDate || t('screens.settings.banned.permanent')}</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer} variant="bodyMedium">
          {t('screens.settings.banned.contactSupport')}
        </Text>

        <Button
          icon={() => <LogOut color={Colors.DESTRUCTIVE} size={18} />}
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
          textColor={Colors.DESTRUCTIVE}
        >
          {t('common.logout')}
        </Button>
      </Surface>
    </ViewContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.BACKGROUND,
  },
  card: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.DESTRUCTIVE,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    color: Colors.TEXT,
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: Fonts.bold,
    color: Colors.ACCENT,
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    color: Colors.TEXT,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: Colors.SECONDARY,
    marginBottom: 30,
    fontSize: 14,
  },
  logoutButton: {
    width: '100%',
    borderColor: Colors.DESTRUCTIVE,
  },
});
