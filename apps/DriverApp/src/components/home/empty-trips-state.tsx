import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { Bus, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

type EmptyTripsStateProps = {
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export const EmptyTripsState = ({ onRefresh, isRefreshing }: EmptyTripsStateProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Bus color={Colors.WARNING} size={48} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{t('screens.home.emptyState.title')}</Text>

      {/* Description */}
      <Text style={styles.description}>{t('screens.home.emptyState.description')}</Text>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onRefresh && (
          <Button
            disabled={isRefreshing}
            icon={() => <RefreshCw color={Colors.PRIMARY} size={18} />}
            loading={isRefreshing}
            mode="outlined"
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            {t('screens.home.emptyState.refresh')}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.WARNING}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.ACCENT,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.SECONDARY}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.TEXT,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  refreshButton: {
    borderColor: Colors.PRIMARY,
  },
  scanButton: {
    backgroundColor: Colors.PRIMARY,
  },
});
