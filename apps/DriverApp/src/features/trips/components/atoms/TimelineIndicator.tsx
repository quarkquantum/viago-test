import { StyleSheet, View } from 'react-native';

type TimelineIndicatorProps = {
  color: string;
  isLast: boolean;
};

export const TimelineIndicator = ({ color, isLast }: TimelineIndicatorProps) => (
  <View style={styles.timeline}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    {!isLast && <View style={[styles.line, { backgroundColor: color }]} />}
  </View>
);

const styles = StyleSheet.create({
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
});
