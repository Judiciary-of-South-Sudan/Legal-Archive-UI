import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import ar from './ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
    interpolation: { escapeValue: false },
  });

// Sync dir + lang attribute with the selected language
i18n.on('languageChanged', (lng) => {
  const isArabic = lng === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
