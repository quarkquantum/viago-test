import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import dayjs from 'dayjs';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type StationInfoProps = {
  departureTime: string | Date;
  name: string;
  cityName?: string;
};

export const StationInfo = ({ departureTime, name, cityName }: StationInfoProps) => (
  <View>
    <Text style={styles.time}>{dayjs(departureTime).format('HH:mm')}</Text>
    <Text style={styles.name}>{name}</Text>
    {cityName && <Text style={styles.city}>{cityName}</Text>}
  </View>
);

const styles = StyleSheet.create({
  time: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.ACCENT,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  city: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.SECONDARY,
  },
});
