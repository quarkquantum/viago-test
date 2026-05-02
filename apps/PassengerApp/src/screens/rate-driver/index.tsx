import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared/constants';
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { useSubmitFeedback } from '@/features/trips/api/use-submit-feedback';
import type { RootStackParamList } from '@/navigation/root-navigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RateDriver'>;

export const RateDriverScreen = ({ route, navigation }: Props) => {
  const { tripId, driverId, tripName, driverName } = route.params;
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const feedbackMutation = useSubmitFeedback();

  const handleSubmit = () => {
    if (rating === 0) return;

    feedbackMutation.mutate(
      {
        tripId,
        driverId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('rating.success'));
          navigation.goBack();
        },
        onError: () => {
          toast.error(t('rating.error'));
        },
      }
    );
  };

  return (
    <Screen back title={t('rating.title')}>
      <View style={styles.container}>
        <Text style={styles.tripName}>{tripName}</Text>
        <Text style={styles.driverName}>{t('rating.driverLabel', { name: driverName })}</Text>

        <Text style={styles.prompt}>{t('rating.prompt')}</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Star
                color={star <= rating ? '#F59E0B' : Colors.SECONDARY}
                fill={star <= rating ? '#F59E0B' : 'transparent'}
                size={40}
              />
            </Pressable>
          ))}
        </View>

        {rating > 0 && <Text style={styles.ratingText}>{t(`rating.labels.${rating}`)}</Text>}

        <TextInput
          label={t('rating.commentLabel')}
          maxLength={1000}
          mode="outlined"
          multiline
          numberOfLines={4}
          onChangeText={setComment}
          placeholder={t('rating.commentPlaceholder')}
          style={styles.input}
          value={comment}
        />

        <Button
          disabled={rating === 0 || feedbackMutation.isPending}
          loading={feedbackMutation.isPending}
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {t('rating.submit')}
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} textColor={Colors.SECONDARY}>
          {t('rating.skip')}
        </Button>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  tripName: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    color: Colors.FOREGROUND,
    textAlign: 'center',
  },
  driverName: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    color: Colors.SECONDARY,
    textAlign: 'center',
  },
  prompt: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    color: Colors.FOREGROUND,
    marginTop: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    color: Colors.PRIMARY,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.BACKGROUND,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
    backgroundColor: Colors.PRIMARY,
  },
});
