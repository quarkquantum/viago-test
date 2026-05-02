import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!(locale && routing.locales.includes(locale as 'en' | 'fr'))) {
    locale = routing.defaultLocale;
  }

  const commonMessages = (await import(`../messages/${locale}/common.json`)).default;

  // Load all translation files for the locale
  const messages = {
    ...commonMessages,
    ...(await import(`../messages/${locale}/auth.json`)).default,
    dashboard: {
      ...(await import(`../messages/${locale}/dashboard.json`)).default,
      ...commonMessages,
    },
    trips: {
      ...(await import(`../messages/${locale}/trips.json`)).default,
      ...commonMessages,
    },
    bookings: {
      ...(await import(`../messages/${locale}/bookings.json`)).default,
      ...commonMessages,
    },
    buses: {
      ...(await import(`../messages/${locale}/buses.json`)).default,
      ...commonMessages,
    },
    drivers: {
      ...(await import(`../messages/${locale}/drivers.json`)).default,
      ...commonMessages,
    },
    agency: {
      ...(await import(`../messages/${locale}/agency.json`)).default,
      ...commonMessages,
    },
    passenger: {
      ...(await import(`../messages/${locale}/passenger.json`)).default,
      ...commonMessages,
    },
    locations: {
      ...(await import(`../messages/${locale}/locations.json`)).default,
      ...commonMessages,
    },
    cashiers: {
      ...(await import(`../messages/${locale}/cashiers.json`)).default,
      ...commonMessages,
    },
    managers: {
      ...(await import(`../messages/${locale}/managers.json`)).default,
      ...commonMessages,
    },
  };

  return {
    locale,
    messages,
  };
});
