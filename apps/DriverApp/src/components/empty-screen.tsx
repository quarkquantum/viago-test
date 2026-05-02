import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const EmptyScreen = ({ icon: Icon, title, description }: Props) => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <Icon color={Colors.SECONDARY} size={32} strokeWidth={1.5} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginBottom: 24,
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: Colors.CARD,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
    color: Colors.SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});
