import { Colors } from '@repo/shared';
import { StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { Skeleton } from './skeleton';

export const TripCardSkeleton = () => {
  return (
    <Surface elevation={1} style={styles.card}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Skeleton borderRadius={8} height={24} width={80} />
          <Skeleton borderRadius={4} height={16} width={100} />
        </View>

        {/* Route Info */}
        <View style={styles.routeContainer}>
          {/* Departure Station */}
          <View style={styles.stationRow}>
            <View style={styles.timeCol}>
              <Skeleton borderRadius={4} height={18} width={45} />
            </View>
            <View style={styles.indicatorCol}>
              {/* Dot */}
              <Skeleton borderRadius={6} height={12} width={12} />
              {/* Line */}
              <View style={styles.lineWrapper}>
                <Skeleton borderRadius={1} height={24} width={2} />
              </View>
            </View>
            <View style={styles.nameCol}>
              <Skeleton borderRadius={4} height={18} width={180} />
            </View>
          </View>

          {/* Arrival Station */}
          <View style={styles.stationRow}>
            <View style={styles.timeCol}>
              <Skeleton borderRadius={4} height={18} width={45} />
            </View>
            <View style={styles.indicatorCol}>
              {/* Pin/Dot */}
              <Skeleton borderRadius={6} height={12} width={12} />
            </View>
            <View style={styles.nameCol}>
              <Skeleton borderRadius={4} height={18} width={140} />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Skeleton borderRadius={4} height={16} width={100} />
          <Skeleton borderRadius={6} height={22} width={70} />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.BACKGROUND,
    margin: 4,
    marginBottom: 12,
    overflow: 'hidden',
    borderColor: Colors.ACCENT_FOREGROUND,
    borderWidth: 1,
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeContainer: {
    marginBottom: 16,
  },
  stationRow: {
    flexDirection: 'row',
    minHeight: 30,
  },
  timeCol: {
    width: 60,
    paddingTop: 2,
  },
  indicatorCol: {
    width: 30,
    alignItems: 'center',
    paddingTop: 6,
  },
  lineWrapper: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  nameCol: {
    flex: 1,
    paddingTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ACCENT_FOREGROUND,
  },
});
