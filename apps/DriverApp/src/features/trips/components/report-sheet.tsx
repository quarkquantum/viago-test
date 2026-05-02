import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FontSizes, Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { ReportType } from '@repo/shared/constants';
import dayjs from 'dayjs';
import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import { toast } from 'sonner-native';
import { useListReports, type DriverReport } from '../api/use-list-reports';
import { useReportTrip } from '../api/use-report-trip';

const DRIVER_REPORT_TYPES = [ReportType.BREAKDOWN, ReportType.DELAY, ReportType.SAFETY, ReportType.OTHER] as const;

type Props = {
  tripId: string;
};

export const ReportSheet = forwardRef<BottomSheet, Props>(({ tripId }, ref) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<(typeof DRIVER_REPORT_TYPES)[number] | null>(null);
  const [content, setContent] = useState('');
  const reportMutation = useReportTrip();
  const { data: reportsData, isLoading: loadingReports, refetch } = useListReports({
    limit: '10',
    page: '1',
    tripId,
  });

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    []
  );

  const handleSubmit = () => {
    if (!selectedType) return;

    reportMutation.mutate(
      {
        tripId,
        type: selectedType,
        content: content.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('report.success'));
          setSelectedType(null);
          setContent('');
          refetch();
          if (ref && 'current' in ref) {
            ref.current?.close();
          }
        },
        onError: () => {
          toast.error(t('report.error'));
        },
      }
    );
  };

  return (
    <BottomSheet ref={ref} backdropComponent={renderBackdrop} enablePanDownToClose index={-1} snapPoints={['55%']}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('report.title')}</Text>
        <Text style={styles.subtitle}>{t('report.subtitle')}</Text>

        <View style={styles.chipContainer}>
          {DRIVER_REPORT_TYPES.map((type) => (
            <Chip
              key={type}
              mode="outlined"
              onPress={() => setSelectedType(type)}
              selected={selectedType === type}
              selectedColor={Colors.PRIMARY}
              style={[styles.chip, selectedType === type && styles.chipSelected]}
            >
              {t(`report.types.${type}`)}
            </Chip>
          ))}
        </View>

        <TextInput
          label={t('report.descriptionLabel')}
          maxLength={1000}
          mode="outlined"
          multiline
          numberOfLines={3}
          onChangeText={setContent}
          placeholder={t('report.descriptionPlaceholder')}
          style={styles.input}
          value={content}
        />

        <Button
          disabled={!selectedType || reportMutation.isPending}
          loading={reportMutation.isPending}
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {t('report.submit')}
        </Button>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>{t('report.recentReports')}</Text>

          {loadingReports ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.PRIMARY} />
            </View>
          ) : reportsData?.data?.length ? (
            reportsData.data.map((report: DriverReport) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportType}>{t(`report.types.${report.type}`)}</Text>
                  <Text style={styles.reportStatus}>{report.status}</Text>
                </View>
                <Text style={styles.reportDate}>{dayjs(report.createdAt).format('DD MMM YYYY • HH:mm')}</Text>
                {report.content ? <Text style={styles.reportContent}>{report.content}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('report.noReports')}</Text>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    color: Colors.TEXT,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.SECONDARY,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: Colors.SECONDARY,
  },
  chipSelected: {
    borderColor: Colors.PRIMARY,
    backgroundColor: `${Colors.PRIMARY}15`,
  },
  input: {
    backgroundColor: Colors.BACKGROUND,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: Colors.PRIMARY,
  },
  listSection: {
    marginTop: 8,
    gap: 8,
  },
  listTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
    color: Colors.ACCENT,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  reportItem: {
    borderWidth: 1,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportType: {
    fontFamily: Fonts.bold,
    color: Colors.ACCENT,
    fontSize: FontSizes.sm,
  },
  reportStatus: {
    fontFamily: Fonts.medium,
    color: Colors.SECONDARY,
    fontSize: FontSizes.xs,
  },
  reportDate: {
    fontFamily: Fonts.regular,
    color: Colors.SECONDARY,
    fontSize: FontSizes.xs,
  },
  reportContent: {
    fontFamily: Fonts.regular,
    color: Colors.TEXT,
    fontSize: FontSizes.sm,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    color: Colors.SECONDARY,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
  },
});
