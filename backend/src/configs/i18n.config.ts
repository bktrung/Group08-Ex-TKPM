import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';
import fs from 'fs';

// Determine the correct path for locales
const getLocalesPath = () => {
  // In development (ts-node), we're running from src/
  const devPath = path.join(__dirname, '../locales');
  // In production (compiled), we're running from dist/src/
  const prodPath = path.join(__dirname, '../../locales');
  
  // Check which path exists
  if (fs.existsSync(devPath)) {
    return devPath;
  } else if (fs.existsSync(prodPath)) {
    return prodPath;
  } else {
    console.error('No locales directory found!');
    return devPath; // fallback
  }
};

const localesPath = getLocalesPath();

i18n
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    // Language detection configuration
    detection: {
      order: ['querystring', 'header'],
      lookupQuerystring: 'lang',
      lookupHeader: 'accept-language',
      caches: false,
    },

    // Fallback language when translation is not found
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'vi'],
    
    // When the key is not found, return the key itself (for English)
    returnEmptyString: false,
    returnNull: false,
    
    // Backend configuration for file system
    backend: {
      // Path to translation files - use the determined path
      loadPath: path.join(localesPath, '{{lng}}/{{ns}}.json'),
    },

    // Additional configuration
    debug: process.env.NODE_ENV === 'dev',
    
    // Interpolation configuration
    interpolation: {
      escapeValue: false, // Not needed for server-side
    },

    // Default namespace
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n; 