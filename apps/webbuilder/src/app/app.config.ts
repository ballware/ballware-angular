import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideNgrxBaseServices, provideNgrxMetaServices } from '@ballware/ngrx-meta-services';
import { provideDxRenderFactoryComponents, provideDxRenderFactoryRoutes } from '@ballware/dx-renderer';
import { provideIdentityBuilderFakeApi, provideBuilderMetaApi } from '@ballware/builder-meta-api';
import { provideBuilderFakeIdentity } from '@ballware/ngrx-builder-services';

import { environment } from '../environments/environment';

declare let window :any;

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(routerReducer),
    provideRouterStore(),
    provideBuilderFakeIdentity(),    
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true
    }),
    provideNgrxBaseServices(),
    provideNgrxMetaServices(),    
    provideDxRenderFactoryComponents({ licenseKey: window.ENV.BALLWARE_DEVEXTREMEKEY }),
    provideDxRenderFactoryRoutes(),
    provideIdentityBuilderFakeApi(),
    provideBuilderMetaApi(),
    
  ],
};
