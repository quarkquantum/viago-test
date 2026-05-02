import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fonts } from '@repo/design-system/mobile/utils/fonts';
import { Colors } from '@repo/shared/constants';
import { Bus, Home, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { BannedScreen } from '@/screens/Banned';
import { HomeScreen } from '@/screens/Home';
import { LoginScreen } from '@/screens/Login';
import { MyProfileScreen } from '@/screens/MyProfile';
import { NotificationsScreen } from '@/screens/Notifications';
import { OTPInputScreen } from '@/screens/OTP';
import { ScanScreen } from '@/screens/Scan';
import { SplashScreen } from '@/screens/Splash';
import { TicketDetailsScreen } from '@/screens/TicketDetails';
import { TripScreen } from '@/screens/Trip';
import { TripsScreen } from '@/screens/Trips';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Scan: { tripId?: string } | undefined;
  Splash: undefined;
  TicketDetails: { ticketId: string };
  Trip: { tripId: string };
  Notifications: undefined;
  Banned: { banReason?: string | null; banExpires?: string | Date | null };

  // Auth
  Login: undefined;
  OTPInput: { email: string };
};

export type RootNav = NativeStackNavigationProp<RootStackParamList>;

const RootStack = createNativeStackNavigator<RootStackParamList>();

type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home': {
              return <Home color={color} size={size} />;
            }
            case 'Trips': {
              return <Bus color={color} size={size} />;
            }
            case 'Profile': {
              return <User color={color} size={size} />;
            }
            default: {
              return null;
            }
          }
        },
        tabBarInactiveTintColor: Colors.ACCENT,
        tabBarLabelStyle: {
          fontFamily: Fonts.bold,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: Colors.BACKGROUND,
          height: 60,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: Colors.ACCENT_FOREGROUND,
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
        component={TripsScreen}
        name="Trips"
        options={{
          tabBarLabel: t('tabs.trips'),
        }}
      />
      <Tab.Screen
        component={MyProfileScreen}
        name="Profile"
        options={{
          tabBarLabel: t('tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.PRIMARY} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <RootStack.Screen component={SplashScreen} name="Splash" />
        <RootStack.Screen component={BannedScreen} name="Banned" />
        {user ? (
          <>
            <RootStack.Screen component={MainTabs} name="MainTabs" />
            <RootStack.Screen component={TripScreen} name="Trip" />
            <RootStack.Screen component={NotificationsScreen} name="Notifications" />
            <RootStack.Screen component={ScanScreen} name="Scan" />
            <RootStack.Screen component={TicketDetailsScreen} name="TicketDetails" />
          </>
        ) : (
          <>
            <RootStack.Screen component={LoginScreen} name="Login" />
            <RootStack.Screen component={ScanScreen} name="Scan" />
            <RootStack.Screen component={TicketDetailsScreen} name="TicketDetails" />
            <RootStack.Screen component={OTPInputScreen} name="OTPInput" />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
