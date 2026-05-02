import dayjs from '@repo/design-system/mobile/utils/dayjs';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared';
import { NotificationDomain, NotificationStatus, NotificationType } from '@repo/shared/constants';
import { NotificationPayload } from '@repo/validators';
import { Bell, Bookmark, Bus, Ticket, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';

// Using a partial type matches the structure we need without strict dependency on local api types
type SharedNotificationData = {
  id: string;
  domain: string;
  type: string;
  status: string;
  payload: NotificationPayload;
  createdAt: string | Date;
  readAt?: string | Date | null;
  entityId: string;
  entityType: string;
};

type NotificationItemProps = {
  notification: SharedNotificationData;
  onPress?: () => void;
  t?: (key: string) => string;
  language?: string;
};

const getDomainIcon = (domain: string) => {
  switch (domain) {
    case NotificationDomain.TRIP:
      return Bus;
    case NotificationDomain.TICKET:
      return Ticket;
    case NotificationDomain.BOOKING:
      return Bookmark;
    case NotificationDomain.USER:
      return User;
    default:
      return Bell;
  }
};

const getDomainColor = (domain: string) => {
  switch (domain) {
    case NotificationDomain.TRIP:
      return Colors.PRIMARY;
    case NotificationDomain.TICKET:
      return Colors.SECONDARY;
    case NotificationDomain.BOOKING:
      return Colors.WARNING;
    case NotificationDomain.USER:
      return Colors.SUCCESS;
    default:
      return Colors.ACCENT;
  }
};

export const NotificationItem = ({ notification, onPress, t: providedT, language }: NotificationItemProps) => {
  const { t: hookT } = useTranslation();
  const t = providedT || hookT;
  const Icon = getDomainIcon(notification.domain);
  const color = getDomainColor(notification.domain);
  const isRead = notification.status === NotificationStatus.READ;

  const renderMessage = () => {
    try {
      const payload = NotificationPayload.parse(notification.payload);

      switch (payload.type) {
        case NotificationType.NEW_TRIP:
          return t('notifications.messages.NEW_TRIP', { tripName: payload.trip.name });
        case NotificationType.NEW_TICKET:
          return t('notifications.messages.NEW_TICKET', {
            ticketKey: payload.ticket.key,
            tripName: payload.trip.name,
          });
        case NotificationType.NEW_BOOKING:
          return t('notifications.messages.NEW_BOOKING', {
            bookingId: payload.booking.id.slice(-6),
            tripName: payload.trip.name,
          });
        case NotificationType.NEW_AGENCY:
          return t('notifications.messages.NEW_AGENCY', { agencyName: payload.agency.name });
        case NotificationType.NEW_DRIVER:
          return t('notifications.messages.NEW_DRIVER', { driverName: payload.driver.name });
        case NotificationType.TRIP_REMINDER:
          return t('notifications.messages.TRIP_REMINDER', { tripName: payload.trip.name });
        default:
          return t(`notifications.domains.${notification.domain}`);
      }
    } catch {
      return t(`notifications.domains.${notification.domain}`);
    }
  };

  return (
    <Surface elevation={isRead ? 0 : 1} style={[styles.container, isRead && styles.readContainer]}>
      <TouchableRipple onPress={onPress} style={styles.ripple}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Icon color={color} size={20} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Text style={styles.type}>{t(`notifications.types.${notification.type}`)}</Text>
              <Text style={styles.time}>
                {dayjs(notification.createdAt)
                  .locale(language || 'en')
                  .fromNow()}
              </Text>
            </View>

            <Text numberOfLines={2} style={styles.payload}>
              {renderMessage()}
            </Text>
          </View>

          {!isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.BACKGROUND,
    overflow: 'hidden',
  },
  readContainer: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ripple: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.ACCENT,
  },
  time: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.SECONDARY,
  },
  payload: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.SECONDARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PRIMARY,
  },
});
