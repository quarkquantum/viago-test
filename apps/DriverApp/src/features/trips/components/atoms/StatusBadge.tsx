import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type StatusBadgeProps = {
  label: string;
  color: string;
  icon: LucideIcon;
  backgroundColor?: string;
};

export const StatusBadge = ({ label, color, icon: Icon, backgroundColor }: StatusBadgeProps) => (
  <View style={[styles.badge, backgroundColor ? { backgroundColor } : { backgroundColor: `${color}15` }]}>
    <Icon color={color} size={14} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
});
