import * as languageEn from './en/translate.json';
import * as languageDe from './de/translate.json';
import { ResourceLanguage } from 'i18next';
import { defaultInterpolationFormat, I18NextModule, I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { APP_INITIALIZER, LOCALE_ID, Provider } from '@angular/core';

function appInit(i18next: ITranslationService) {
  return () => i18next
    .init({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
      resources: {
        en: languageEn as ResourceLanguage,
        de: languageDe as ResourceLanguage
      },
      defaultNS: 'translations',
      debug: true,
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

