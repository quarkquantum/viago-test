export type RootStackParamList = {
  // Universal
  Onboarding: undefined;
  Home: undefined;
  Reservation: { tripId: string };

  // Auth
  Login: undefined;
  OTPInput: { email: string };

  // Protected
  MyProfile: undefined;
  Settings: undefined;
  Payment: { ticketId: string };
};
