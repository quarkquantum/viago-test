import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

export const SummaryCard = ({ label, value, icon }: SummaryCardProps) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
    <View style={styles.content}>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.CARD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.SECONDARY,
    letterSpacing: 1.2,
  },
  content: {
    flex: 1,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.ACCENT,
    lineHeight: 34,
  },
  iconContainer: {
    padding: 4,
    opacity: 0.6,
  },
});
