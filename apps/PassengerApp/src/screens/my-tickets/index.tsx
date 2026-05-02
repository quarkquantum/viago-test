import { useNavigation } from '@react-navigation/native';
import { Screen } from '@repo/design-system/mobile/components/screen';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors, TicketStatus } from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import { SearchX, TicketIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, TextInput } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { useAuth } from '@/contexts/auth-context';
import { useGuestTicketLookup } from '@/features/me/api/use-guest-ticket-lookup';
import type { Route as Ticket } from '@/features/me/api/use-list-my-tickets';
import { useListMyTickets } from '@/features/me/api/use-list-my-tickets';
import type { RootNav } from '@/navigation/root-navigator';
import { TicketCard } from './ticket-card';

type GuestTicket = {
  id: string;
  status: string;
  booking?: {
    trip?: { name?: string };
    fromStation?: { name?: string };
    toStation?: { name?: string };
  };
};

const GuestView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();
  const { scrollHandler, insets } = Screen.useContext();

  const [identifier, setIdentifier] = useState('');
  const [submittedIdentifier, setSubmittedIdentifier] = useState('');

  const { data, isLoading } = useGuestTicketLookup(submittedIdentifier, {
    enabled: !!submittedIdentifier,
  });

  // biome-ignore lint/suspicious/noExplicitAny: hook response type not inferred
  const tickets: GuestTicket[] = (data as any)?.data ?? [];

  const handleSearch = () => {
    const trimmed = identifier.trim();
    if (trimmed) {
      setSubmittedIdentifier(trimmed);
    }
  };

  return (
    <Animated.ScrollView
      contentContainerStyle={[styles.guestContainer, { paddingBottom: insets.bottom + 40 }]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <TicketIcon color={Colors.ACCENT} size={64} />
      <Text style={styles.guestTitle}>{t('tickets.guest.title')}</Text>
      <Text style={styles.guestMessage}>{t('tickets.guest.message')}</Text>

      {/* Lookup */}
      <View style={styles.lookupSection}>
        <Text style={styles.lookupTitle}>{t('tickets.guest.lookupTitle')}</Text>
        <TextInput
          label={t('tickets.guest.identifierLabel')}
          mode="outlined"
          onChangeText={setIdentifier}
          outlineStyle={styles.lookupInputOutline}
          placeholder={t('tickets.guest.identifierPlaceholder')}
          style={styles.lookupInput}
          value={identifier}
        />
        <Button loading={isLoading} mode="outlined" onPress={handleSearch}>
          {t('tickets.guest.lookupButton')}
        </Button>
      </View>

      {submittedIdentifier && !isLoading && tickets.length === 0 && (
        <Text style={styles.lookupEmpty}>{t('tickets.guest.lookupEmpty')}</Text>
      )}

      {tickets.map((ticket) => (
        <Card key={ticket.id} style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultTrip}>{ticket.booking?.trip?.name}</Text>
            <Text style={styles.resultRoute}>
              {ticket.booking?.fromStation?.name} → {ticket.booking?.toStation?.name}
            </Text>
            <Text style={styles.resultStatus}>{ticket.status}</Text>
          </Card.Content>
        </Card>
      ))}

      {/* Auth CTAs */}
      <View style={styles.authButtons}>
        <Text style={styles.orText}>{t('tickets.guest.orSignIn')}</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.authButton}>
          {t('screens.settings.goToLogin')}
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('Register')} style={styles.authButton}>
          {t('screens.onboarding.signup')}
        </Button>
      </View>
    </Animated.ScrollView>
  );
};

const TicketsList = ({ tickets }: { tickets: Ticket[] }) => {
  const { scrollHandler, insets } = Screen.useContext();
  const { t } = useTranslation();
  const navigation = useNavigation<RootNav>();

  return (
    <FlashList
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 24,
      }}
      data={tickets}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <SearchX color={Colors.PRIMARY} size={32} />
          </View>
          <Text style={styles.emptyTitle}>{t('tickets.empty')}</Text>
          <Text style={styles.emptyMessage}>{t('tickets.emptyMessage')}</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Rides', params: {} })}
            style={styles.emptyButton}
          >
            {t('tickets.browseRides')}
          </Button>
        </View>
      }
      onScroll={scrollHandler}
      renderItem={({ item }) => <TicketCard item={item} />}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
};

export const MyTicketsScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TicketStatus>(TicketStatus.ISSUED);

  const { data, isLoading } = useListMyTickets({ sortOrder: 'desc', status: statusFilter }, { enabled: !!user });

  const tickets = (data?.data ?? []).filter((item): item is Ticket => item != null);

  const tabs = [
    { label: t('tickets.status.issued'), value: TicketStatus.ISSUED },
    { label: t('tickets.status.cancelled'), value: TicketStatus.CANCELLED },
    { label: t('tickets.status.expired'), value: TicketStatus.EXPIRED },
  ];

  return (
    <Screen padded scrollable={false} title={t('screens.tickets.title')}>
      {user ? (
        <>
          <View style={styles.tabsBar}>
            <View style={styles.tabsRow}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  activeOpacity={0.75}
                  key={tab.value}
                  onPress={() => setStatusFilter(tab.value)}
                  style={[styles.tab, statusFilter === tab.value && styles.tabActive]}
                >
                  <Text style={[styles.tabLabel, statusFilter === tab.value && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.tabsBorder} />
          </View>

          {/* ─── CONTENT ─── */}
          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator color={Colors.PRIMARY} size="large" />
              <Text style={styles.loadingText}>{t('tickets.loading')}</Text>
            </View>
          ) : (
            <TicketsList tickets={tickets} />
          )}
        </>
      ) : (
        <GuestView />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabsBar: {
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 9,
  },
  tabActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  tabLabel: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  tabLabelActive: {
    color: Colors.BACKGROUND,
  },
  tabsBorder: {
    backgroundColor: Colors.ACCENT_FOREGROUND,
    height: StyleSheet.hairlineWidth,
  },

  stateContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: `${Colors.PRIMARY}15`,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 4,
    width: 80,
  },
  emptyTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  loadingText: {
    color: Colors.TEXT,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginTop: 4,
  },

  guestContainer: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  guestTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  guestMessage: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  lookupSection: {
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  lookupTitle: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  lookupInput: {
    backgroundColor: Colors.BACKGROUND,
    width: '100%',
  },
  lookupInputOutline: {
    borderColor: Colors.ACCENT_FOREGROUND,
    borderRadius: 12,
  },
  lookupEmpty: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
  },
  resultTrip: {
    color: Colors.ACCENT,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  resultRoute: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  resultStatus: {
    color: Colors.PRIMARY,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  authButtons: {
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  orText: {
    color: Colors.SECONDARY,
    fontFamily: Fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  authButton: {
    width: '100%',
  },
});
