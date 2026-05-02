import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!(locale && routing.locales.includes(locale as 'en' | 'fr'))) {
    locale = routing.defaultLocale;
  }

  // Load all translation files for the locale
  // This allows splitting translations into multiple files for better organization
  const messages = {
    ...(await import(`../messages/${locale}/common.json`)).default,
    ...(await import(`../messages/${locale}/auth.json`)).default,
    agencies: (await import(`../messages/${locale}/agencies.json`)).default,
    agencyManagers: (await import(`../messages/${locale}/agencyManagers.json`)).default,
    agencyRequests: (await import(`../messages/${locale}/agencyRequests.json`)).default,
    billing: (await import(`../messages/${locale}/billing.json`)).default,
    bookings: (await import(`../messages/${locale}/bookings.json`)).default,
    buses: (await import(`../messages/${locale}/buses.json`)).default,
    cashiers: (await import(`../messages/${locale}/cashiers.json`)).default,
    dashboard: (await import(`../messages/${locale}/dashboard.json`)).default,
    drivers: (await import(`../messages/${locale}/drivers.json`)).default,
    locations: (await import(`../messages/${locale}/locations.json`)).default,
    revenues: (await import(`../messages/${locale}/revenues.json`)).default,
    tickets: (await import(`../messages/${locale}/tickets.json`)).default,
    trips: (await import(`../messages/${locale}/trips.json`)).default,
    users: (await import(`../messages/${locale}/users.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
