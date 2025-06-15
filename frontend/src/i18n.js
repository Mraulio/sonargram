// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones locales
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n
  .use(LanguageDetector) // Detecta automáticamente el idioma del navegador
  .use(initReactI18next) // Conecta con react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
    },
    fallbackLng: 'en', // Si no se detecta idioma o falta traducción
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
