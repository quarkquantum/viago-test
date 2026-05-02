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
    agencies: (await import(`../messages/${locale}/agencies.json`)).default,
    agencyRequests: (await import(`../messages/${locale}/agencyRequests.json`)).default,
    admins: (await import(`../messages/${locale}/admins.json`)).default,
    drivers: (await import(`../messages/${locale}/drivers.json`)).default,
    stats: (await import(`../messages/${locale}/stats.json`)).default,
    agencyOwner: (await import(`../messages/${locale}/agency-managers.json`)).default.agencyOwner,
  };

  return {
    locale,
    messages,
  };
});
