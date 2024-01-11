import { APP_INITIALIZER, LOCALE_ID, Provider } from '@angular/core';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService, defaultInterpolationFormat } from 'angular-i18next';
import { ResourceLanguage } from 'i18next';
import * as languageDe from './de/translate.json';
import * as languageEn from './en/translate.json';

function appInit(i18next: ITranslationService) {
  return () => i18next
    .init({
      supportedLngs: ['en', 'de'],
      lng: navigator.language,
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
        format: I18NextModule.interpolationFormat(defaultInterpolationFormat)
      },
    });
}

function localeIdFactory(i18next: ITranslationService)  {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true
  } as Provider,
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory
  } as Provider
] as Provider[];

