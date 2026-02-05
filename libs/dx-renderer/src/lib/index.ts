import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  LOCALE_ID,
  makeEnvironmentProviders,
  provideAppInitializer,
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
import { ChatPageComponent, DefaultRedirectComponent, PageComponent } from './page';
import { I18N_PROVIDERS } from './i18n/i18n';
import { PrintComponent } from './application';
import {
  createLookupDelegateBuilder,
  LOOKUP_DELEGATE_BUILDER_FACTORY,
} from './utils';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  PickvalueCreator,
} from '@ballware/meta-services';
import { provideDefaultItemRegistries } from './registries';
import {
  provideDefaultColumnConfigurations,
  provideDefaultEditItems,
  provideDefaultPageItems,
  provideDefaultToolbarItemConfigurations,
} from './components';
import { provideServerRouting, RenderMode, ServerRoute } from '@angular/ssr';

export * from './directives';
export * from './page';
export { ApplicationComponent } from './application';

export interface DxRenderFactoryConfig {
  licenseKey: string
}

export const DX_RENDERFACTORY_CONFIG = new InjectionToken<DxRenderFactoryConfig>('DxRenderFactoryConfig');

export function provideDxRenderFactoryComponents(): EnvironmentProviders {

  return makeEnvironmentProviders([
    provideI18Next(),
    I18N_PROVIDERS,
    provideAppInitializer(() => {
      const config = inject(DX_RENDERFACTORY_CONFIG);
      const locale_id = inject(LOCALE_ID);

      globalConfig(
        {
          licenseKey: config.licenseKey,
          editorStylingMode: 'underlined'
        }
      );

      loadMessages(deMessages);
      locale(locale_id);

      moment.locale(
        locale_id
      );
    }),
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

const browserRoutes: Routes = [
  {
    path: 'print',
    component: PrintComponent
  },
  {
    path: 'chat',
    component: ChatPageComponent
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

const serverRoutes: ServerRoute[] = [
  {
    path: 'print',
    renderMode: RenderMode.Client,
  },
  {
    path: 'page/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
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

export function provideDxRenderFactoryBrowserRoutes(): EnvironmentProviders {

  return makeEnvironmentProviders([
    {
      provide: RouteReuseStrategy,
      useClass: NoReuseOnParamChangeStrategy,
    },
    provideRouter(browserRoutes, withComponentInputBinding()),
  ]);
}

export function provideDxRenderFactoryServerRoutes(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: RouteReuseStrategy,
      useClass: NoReuseOnParamChangeStrategy,
    },
    provideRouter(browserRoutes, withComponentInputBinding()),
    provideServerRouting(serverRoutes),
  ]);
}
