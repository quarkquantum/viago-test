import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type PassengerCounterProps = {
  count: number;
  onPress?: () => void;
};

export const PassengerCounter = ({ count, onPress }: PassengerCounterProps) => {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} style={styles.toggle}>
      <UserIcon color={Colors.SECONDARY} size={14} />
      <Text style={styles.toggleText}>{t('trips.details.passengerCount', { count })}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
});
