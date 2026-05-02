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
    dashboard: (await import(`../messages/${locale}/dashboard.json`)).default,
    passenger: (await import(`../messages/${locale}/passenger.json`)).default,
    tickets: (await import(`../messages/${locale}/tickets.json`)).default,
    trips: (await import(`../messages/${locale}/trips.json`)).default,
    quickSale: (await import(`../messages/${locale}/quickSale.json`)).default,
    quickSearch: (await import(`../messages/${locale}/quickSearch.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
