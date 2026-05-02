import { Colors } from '@repo/shared';
import { StationStatus } from '@repo/shared/constants';
import { CheckCircle, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Station } from '../api/use-get-trip';
import { getStationStatusColor } from '../utils/trip-helpers';
import { StatusBadge } from './atoms/StatusBadge';
import { TimelineIndicator } from './atoms/TimelineIndicator';
import { PassengerCounter } from './molecules/PassengerCounter';
import { StationActionButtons } from './molecules/StationActionButtons';
import { StationInfo } from './molecules/StationInfo';

type StationRowProps = {
  station: Station;
  isLast: boolean;
  onStartStation: () => void;
  onCompleteStation: () => void;
  onScanTickets: () => void;
  tripId: string;
};

export const StationRow = ({
  station,
  isLast,
  onStartStation,
  onCompleteStation,
  onScanTickets,
  tripId,
}: StationRowProps) => {
  const { t } = useTranslation();
  const [showPassengers, setShowPassengers] = useState(false);
  const statusColor = getStationStatusColor(station.status as StationStatus);
  const { actions } = station;
  const boardingPassengers = station.bookingsFrom ?? [];
  const dropOffPassengers = station.bookingsTo ?? [];
  const totalPassengers = boardingPassengers.length + dropOffPassengers.length;

  return (
    <View style={styles.container}>
      <TimelineIndicator color={statusColor} isLast={isLast} />

      <View style={styles.content}>
        <View style={styles.header}>
          <StationInfo cityName={station.city?.name} departureTime={station.departureTime} name={station.name} />

          {station.status === StationStatus.COMPLETED && (
            <StatusBadge color={Colors.SUCCESS} icon={CheckCircle} label={t('trips.actions.stationCompleted')} />
          )}

          {(station.status === StationStatus.ACTIVE || station.status === StationStatus.BOARDING) && (
            <StatusBadge
              color={Colors.SECONDARY}
              icon={Clock}
              label={station.status === StationStatus.ACTIVE ? t('trips.actions.arrived') : t('trips.actions.boarding')}
            />
          )}
        </View>

        <StationActionButtons
          actions={actions}
          onArrive={onStartStation}
          onFinish={onCompleteStation}
          onScanTickets={onScanTickets}
          onStartBoarding={onStartStation}
          onStartTrip={onStartStation}
          onViewPassengers={() => setShowPassengers((prev) => !prev)}
          tripId={tripId}
        />

        <PassengerCounter count={totalPassengers} onPress={() => setShowPassengers((prev) => !prev)} />

        {showPassengers && (
          <View style={styles.passengerList}>
            {totalPassengers === 0 ? (
              <Text style={styles.emptyPassengersText}>{t('trips.details.noPassengers')}</Text>
            ) : (
              <>
                {boardingPassengers.length > 0 && (
                  <View style={styles.passengerSection}>
                    <Text style={styles.passengerSectionTitle}>{t('trips.details.boardingPassengers')}</Text>
                    {boardingPassengers.map((booking) => (
                      <View key={`boarding-${booking.id}`} style={styles.passengerItem}>
                        <View style={styles.passengerHeader}>
                          <View style={[styles.passengerDot, { backgroundColor: Colors.PRIMARY }]} />
                          <Text style={styles.passengerName}>{booking.passenger?.fullName || t('common.na')}</Text>
                        </View>
                        <Text style={styles.passengerMeta}>
                          {t('trips.details.seat')}: {booking.seat?.number ?? '-'} • {booking.passenger?.profile?.phoneNumber || t('trips.details.noPhone')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {dropOffPassengers.length > 0 && (
                  <View style={styles.passengerSection}>
                    <Text style={styles.passengerSectionTitle}>{t('trips.details.dropOffPassengers')}</Text>
                    {dropOffPassengers.map((booking) => (
                      <View key={`dropoff-${booking.id}`} style={styles.passengerItem}>
                        <View style={styles.passengerHeader}>
                          <View style={[styles.passengerDot, { backgroundColor: Colors.SECONDARY }]} />
                          <Text style={styles.passengerName}>{booking.passenger?.fullName || t('common.na')}</Text>
                        </View>
                        <Text style={styles.passengerMeta}>
                          {t('trips.details.seat')}: {booking.seat?.number ?? '-'} • {booking.passenger?.profile?.phoneNumber || t('trips.details.noPhone')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 80,
  },
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passengerList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
  },
  passengerSection: {
    marginBottom: 10,
  },
  passengerSectionTitle: {
    color: Colors.ACCENT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  passengerItem: {
    marginBottom: 8,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.PRIMARY,
    marginRight: 8,
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerName: {
    color: Colors.ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
  passengerMeta: {
    color: Colors.SECONDARY,
    fontSize: 12,
    marginLeft: 14,
    marginTop: 2,
  },
  emptyPassengersText: {
    color: Colors.SECONDARY,
    fontSize: 12,
    fontStyle: 'italic',
  },
  passengerNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nameHeader: {
    flexDirection: 'row',
  },
  nameMain: {
    flexDirection: 'row',
  },
  nameLabelContainer: {
    flexDirection: 'row',
  },
  indicator: {
    width: 3,
  },
  textContainer: {
    paddingLeft: 4,
  },
  nameGroup: {
    flexDirection: 'row',
  },
  topRow: {
    flexDirection: 'row',
  },
  nameWrapper: {
    flexDirection: 'row',
  },
  nameTextContainer: {
    flexDirection: 'row',
  },
});
