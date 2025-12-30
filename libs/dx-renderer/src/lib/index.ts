import {
  EnvironmentProviders,
  inject,
  Injectable, LOCALE_ID,
  makeEnvironmentProviders
} from '@angular/core';
import { provideI18Next } from 'angular-i18next';

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
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from './utils';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  PickvalueCreator
} from '@ballware/meta-services';
import { provideDefaultItemRegistries } from './registries';
import {
  provideDefaultColumnConfigurations, provideDefaultEditItems, provideDefaultPageItems,
  provideDefaultToolbarItemConfigurations
} from './components';

export * from './directives';
export * from './page';
export { ApplicationComponent } from './application';

export interface DxRenderFactoryConfig {
  licenseKey: string
}

export function provideDxRenderFactoryComponents(config: DxRenderFactoryConfig): EnvironmentProviders {

  const locale_id = inject(LOCALE_ID);

  loadMessages(deMessages);
  locale(locale_id);

  moment.locale(
    locale_id
  );

  globalConfig(
    {
      licenseKey: config.licenseKey,
      editorStylingMode: 'underlined'
    }
  );

  return makeEnvironmentProviders([
    provideI18Next(),
    I18N_PROVIDERS,
    provideDefaultItemRegistries(),
    provideDefaultPageItems(),
    provideDefaultEditItems(),
    provideDefaultToolbarItemConfigurations(),
    provideDefaultColumnConfigurations(),
    {
      provide: LOOKUP_DELEGATE_BUILDER_FACTORY,
      useFactory: () => (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => createLookupDelegateBuilder(lookups)
    }
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
  store(): void {
    // no implementation
  }
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
