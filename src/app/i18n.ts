import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translations from '../../public/locales/en/translations.json'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: [
      // --------- languages ---------
      'en',
      'sl',
      'zh',
      'fr',
      'es',
      'de',
      'pt-BR',
      'nl',
      'pl',
      'lt',
      'ar',
      'cs',
      'hi',
      'pa-IN',
      'tr',
      'id',
      'fa',
      'la',
      'sw',
      'bg',
      'lv',
      'nb',
      'sv',
      'vn',
      'zh-TW',
      'ru',
      'uk',
      'ml',
      'pt',
      'th',
      'yo',
      'kk',
      'ka',
      'pcm',
      'hy',
      'sr',
      'hr',
      'it',
      'uz',
      'corp',
      'gu',
      'he',
      'tl',
      'ha',
      'fi',
      'ro',
      'bs',
      'hu',
      'ee',
      'tw',
      'ig',
      'idu',
      'ja',
      'el',
      'ms',
      'mr',
      'igala',
      'igede',
      'tiv',
      'fante',
      'ko',
      'bho',
      'ta',
      'kn',
      'te',
      'bn',
      'zu',
      'am',
      'et',
      'af',
      'ga',
      'km',
      'xh',
      'jv',
      'ca',
      'mn',
      'cy',
      'lo',
      'es-MX',
      'ug',
      'az',
      'ur',
      'or',
      'yue',
      // --------- special languages ---------
      'pirate',
      'genalpha',
      'shakespearean',
      'frens',
      'ermahgersh',
      'millennial'
      // 'halloween'
    ],
    fallbackLng: 'en',
    keySeparator: '.',
    defaultNS: 'translations',
    ns: ['translations'],
    react: {
      useSuspense: true
    }
  })

// preload languages
i18n.addResourceBundle('en', 'translations', translations)

export default i18n
