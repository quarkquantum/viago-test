import { View } from 'react-native';
import styles from './styles';

export const SettingsSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonText} />
    <View style={styles.skeletonText} />
    <View style={[styles.skeletonText, { width: '60%' }]} />
  </View>
);
