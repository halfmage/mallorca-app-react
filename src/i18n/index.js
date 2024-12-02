import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import de from './de.json';
import es from './es.json';

i18n
  .use(LanguageDetector) // Automatically detect the user's language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      es: { translation: es }
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
