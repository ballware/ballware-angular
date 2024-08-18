import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { loadMessages, locale } from 'devextreme/localization';
import deMessages from 'devextreme/localization/messages/de.json';

import moment from 'moment';

import globalConfig from 'devextreme/core/config';
import { provideRouter, Routes } from '@angular/router';
import { PageComponent } from './page';
import { I18N_PROVIDERS } from './i18n/i18n';

export { ApplicationComponent } from './application';

export interface DxRenderFactoryConfig {
  licenseKey: string
}

export function provideDxRenderFactoryComponents(config: DxRenderFactoryConfig): EnvironmentProviders {

  loadMessages(deMessages);
  locale(navigator.language);    

  moment.locale(
    navigator.languages ? navigator.languages[0] : navigator.language
  );

  globalConfig(
    { 
      licenseKey: config.licenseKey, 
      editorStylingMode: 'underlined'        
    }
  );

  return makeEnvironmentProviders([
    importProvidersFrom(I18NextModule.forRoot()),
    I18N_PROVIDERS
  ]); 
}

const routes: Routes = [
  {
      path: 'page/:id',
      component: PageComponent
  },
  {
      path: '**',
      redirectTo: 'page/default'
  }
];

export function provideDxRenderFactoryRoutes(): EnvironmentProviders {

  return makeEnvironmentProviders([
    provideRouter(routes)]
  ); 
}