import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './en.json';
import es from './es.json';

const i18n = new I18n({
  en,
  es
});

// Get device locale and extract language code
const deviceLocale = Localization.getLocales()[0];
const languageCode = deviceLocale?.languageCode || 'en';

// Set the locale - default to 'en' if not supported
i18n.locale = languageCode === 'es' ? 'es' : 'en';

// Allow fallback to English if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
