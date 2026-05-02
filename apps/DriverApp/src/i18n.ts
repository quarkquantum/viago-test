import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import fr from './locales/fr.json';

// Const locales = RNLocalize.getLocales();

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n.use(initReactI18next).init({
  debug: __DEV__,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources,
});

export default i18n;
