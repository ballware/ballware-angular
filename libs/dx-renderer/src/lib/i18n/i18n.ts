import { LOCALE_ID, provideAppInitializer, Provider, inject } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService, interpolationFormat, defaultInterpolationFormat } from 'angular-i18next';
import { ResourceLanguage } from 'i18next';
import * as languageDe from './de/translate.json';
import * as languageEn from './en/translate.json';

function appInit() {
  const localeId = inject(LOCALE_ID);
  const i18next = inject(I18NEXT_SERVICE);

  return i18next.init({
      supportedLngs: ['en', 'de'],
      lng: localeId,
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

function localeIdFactory(i18next: ITranslationService)  {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  provideAppInitializer(appInit),
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory
  } as Provider
] as Provider[];

