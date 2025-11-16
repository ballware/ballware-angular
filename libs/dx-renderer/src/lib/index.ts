import {
  EnvironmentProviders,
  importProvidersFrom,
  Injectable,
  makeEnvironmentProviders,
} from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { loadMessages, locale } from 'devextreme/localization';
import deMessages from 'devextreme/localization/messages/de.json';

import moment from 'moment';

import globalConfig from 'devextreme/core/config';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  provideRouter,
  RouteReuseStrategy,
  Routes,
  withComponentInputBinding,
} from '@angular/router';
import { DefaultRedirectComponent, PageComponent } from './page';
import { I18N_PROVIDERS } from './i18n/i18n';
import { PrintComponent } from './application';

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
    path: 'print',
    component: PrintComponent
  },
  {
    path: 'page/:id',
    component: PageComponent,
    data: { forceNewOnParamChange: ['id'] }
  },
  {
      path: '**',
      component: DefaultRedirectComponent
  }
];

@Injectable()
export class NoReuseOnParamChangeStrategy implements RouteReuseStrategy {
  shouldDetach(): boolean { return false; }
  store(): void {}
  shouldAttach(): boolean { return false; }
  retrieve(): DetachedRouteHandle | null { return null; }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {

    if (future.routeConfig !== curr.routeConfig) return false;

    const paramIds = (future.data?.['forceNewOnParamChange'] || curr.data?.['forceNewOnParamChange']) as Array<string>;

    if (paramIds) {
      return !paramIds.filter(id => {
        const next = future.paramMap.get(id);
        const prev = curr.paramMap.get(id);

        return next !== prev;
      }).length;
    }

    return true;
  }
}

export function provideDxRenderFactoryRoutes(): EnvironmentProviders {

  return makeEnvironmentProviders([
    {
      provide: RouteReuseStrategy, useClass: NoReuseOnParamChangeStrategy,
    },
    provideRouter(routes, withComponentInputBinding())]
  );
}
