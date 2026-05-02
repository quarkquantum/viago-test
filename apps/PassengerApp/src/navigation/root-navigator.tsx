import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared/constants';
import { Bus, Home, Settings, TicketPlus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { HomeScreen } from '@/screens/home';
import { LoginScreen } from '@/screens/login';
import { MyTicketsScreen } from '@/screens/my-tickets';
import { NotificationsScreen } from '@/screens/notifications';
import { OnboardingScreen } from '@/screens/onboarding';
import { OTPInputScreen } from '@/screens/otp';
import { PaymentScreen } from '@/screens/payment';
import { RateDriverScreen } from '@/screens/rate-driver';
import { RegisterScreen } from '@/screens/register';
import { ReservationScreen } from '@/screens/reservation';
import { RidesScreen } from '@/screens/rides';
import { SeatSelectionScreen } from '@/screens/seat-selection';
import { SettingsScreen } from '@/screens/settings';
import { SplashScreen } from '@/screens/splash';
import { TicketDetailsScreen } from '@/screens/ticket-details';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined; // Bottom tabs container
  Reservation: {
    tripId: string;
    fromStationId: string;
    toStationId: string;
    price: number;
    fromStationName: string;
    toStationName: string;
    seatReservationType: string;
    busSeats: { id: string; status: string; type: string }[];
    busId: string;
    selectedSeatId?: string;
  };
  SeatSelection: {
    tripId: string;
    fromStationId: string;
    toStationId: string;
    price: number;
    fromStationName: string;
    toStationName: string;
    busSeats: { id: string; status: string; type: string }[];
    busId: string;
  };
  TicketDetails: { ticketId: string };

  // Auth
  Login: undefined;
  Register: undefined;
  OTPInput: { email: string };

  // Protected
  Payment: { bookingId: string };
  Notifications: undefined;
  RateDriver: { tripId: string; driverId: string; tripName: string; driverName: string };
};

export type RootNav = NativeStackNavigationProp<RootStackParamList>;

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Tabs shown when user is in the main app area
type MainTabParamList = {
  Home: undefined;
  MyTickets: undefined;
  Rides: {
    from?: string;
    to?: string;
    date?: string;
    search?: string;
  };
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color }) => {
          switch (route.name) {
            case 'Home': {
              return <Home color={color} />;
            }
            case 'MyTickets': {
              return <TicketPlus color={color} />;
            }
            case 'Rides': {
              return <Bus color={color} />;
            }
            case 'Settings': {
              return <Settings color={color} />;
            }
            default: {
              return;
            }
          }
        },
        tabBarInactiveTintColor: Colors.BACKGROUND,
        tabBarLabelStyle: {
          fontFamily: Fonts.bold,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: Colors.ACCENT,
          height: 70,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarLabel: t('tabs.home'),
        }}
      />
      <Tab.Screen
        component={RidesScreen}
        name="Rides"
        options={{
          tabBarLabel: t('tabs.rides'),
        }}
      />
      <Tab.Screen
        component={MyTicketsScreen}
        name="MyTickets"
        options={{
          tabBarLabel: t('tabs.my_tickets'),
        }}
      />
      <Tab.Screen
        component={SettingsScreen}
        name="Settings"
        options={{
          tabBarLabel: t('tabs.settings'),
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <RootStack.Screen component={SplashScreen} name="Splash" />
        <RootStack.Screen component={OnboardingScreen} name="Onboarding" />
        <RootStack.Screen component={MainTabs} name="MainTabs" />
        <RootStack.Screen component={ReservationScreen} name="Reservation" />
        <RootStack.Screen component={SeatSelectionScreen} name="SeatSelection" />
        <RootStack.Screen component={TicketDetailsScreen} name="TicketDetails" />
        <RootStack.Screen component={LoginScreen} name="Login" />
        <RootStack.Screen component={RegisterScreen} name="Register" />
        <RootStack.Screen component={OTPInputScreen} name="OTPInput" />
        <RootStack.Screen component={PaymentScreen} name="Payment" />
        <RootStack.Screen component={NotificationsScreen} name="Notifications" />
        <RootStack.Screen component={RateDriverScreen} name="RateDriver" />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
