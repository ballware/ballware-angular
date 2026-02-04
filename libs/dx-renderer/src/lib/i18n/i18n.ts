import { LOCALE_ID, provideAppInitializer, Provider, inject, EnvironmentProviders } from '@angular/core';
import { I18NEXT_SERVICE, interpolationFormat, defaultInterpolationFormat, ITranslationService } from 'angular-i18next';
import { ResourceLanguage } from 'i18next';
import * as languageDe from './de/translate.json';
import * as languageEn from './en/translate.json';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';

function appInit() {
  const i18next = inject(I18NEXT_SERVICE);

  return i18next
    .use(I18nextBrowserLanguageDetector)
    .init({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
      resources: {
        en: languageEn as ResourceLanguage,
        de: languageDe as ResourceLanguage
      },
      defaultNS: 'translations',
      debug: false,
      returnEmptyString: false,
      ns: [
        'translations'
      ],
      interpolation: {
        format: interpolationFormat(defaultInterpolationFormat)
      },
    });
}

export const I18N_PROVIDERS = [
  provideAppInitializer(appInit),
  {
    provide: LOCALE_ID,
    useFactory: (i18next: ITranslationService) => {
      return i18next.language;
    },
    deps: [I18NEXT_SERVICE]
  }
] as EnvironmentProviders[];

