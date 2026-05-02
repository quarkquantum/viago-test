export type RootStackParamList = {
  // Universal
  Onboarding: undefined;
  Home: undefined;
  Reservation: { tripId: string };

  // Auth
  Login: undefined;
  Register: undefined;
  OTPInput: { email: string };

  // Protected
  MyProfile: undefined;
  MyTickets: undefined;
  Settings: undefined;
  Payment: { ticketId: string };
};
