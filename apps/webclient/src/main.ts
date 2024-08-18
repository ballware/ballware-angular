import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideNgrxMetaServices } from '@ballware/ngrx-meta-services';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { ROUTES } from './app/app.routing';
import { MetaApiModule } from '@ballware/meta-api';
import { provideDxRenderFactoryComponents, provideDxRenderFactoryRoutes } from '@ballware/dx-renderer';
import { provideServiceWorker } from '@angular/service-worker';

import { environment } from './environments/environment';
import { BearerTokenInterceptor } from './app/shared/interceptors/bearertoken.interceptor';
import { provideRouter, withComponentInputBinding } from '@angular/router';

declare let window :any;

bootstrapApplication(AppComponent, {
  providers: [    
    provideHttpClient(withInterceptors([BearerTokenInterceptor])),
    provideStore(routerReducer),
    provideRouterStore(),
    provideRouter(ROUTES, withComponentInputBinding()),
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true
    }),
    provideOAuthClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideNgrxMetaServices(),
    provideDxRenderFactoryComponents({ licenseKey: window.ENV.BALLWARE_DEVEXTREMEKEY }),
    provideDxRenderFactoryRoutes(),
    importProvidersFrom(          
      MetaApiModule.forRoot({
        identityServiceBaseUrl: window.ENV.BALLWARE_IDENTITYURL,
        metaServiceBaseUrl: window.ENV.BALLWARE_METAURL,
        documentServiceBaseUrl: window.ENV.BALLWARE_DOCUMENTURL,
        storageServiceBaseUrl: window.ENV.BALLWARE_STORAGEURL
      }),
    )
  ]
});

