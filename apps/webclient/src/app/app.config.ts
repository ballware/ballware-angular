import { ApplicationConfig, importProvidersFrom } from '@angular/core';

import { provideNgrxMetaServices, provideNgrxOidcIdentityService } from '@ballware/ngrx-meta-services';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import {
  provideIdentityKeycloakRestApi,
  provideMetaBackendRestApi,
  provideGenericBackendRestApi,
  provideDocumentBackendRestApi,
  IDENTITY_KEYCLOAK_REST_API_CONFIG, META_REST_API_CONFIG, IdentityKeycloakRestApiConfig, MetaRestApiConfig,
  DOCUMENT_API_CONFIG, DocumentRestApiConfig, GENERIC_API_CONFIG, GenericRestApiConfig
} from '@ballware/rest-meta-api';
import {
  DX_RENDERFACTORY_CONFIG,
  provideDxRenderFactoryComponents,
  provideDxRenderFactoryRoutes
} from '@ballware/dx-renderer';
import { provideServiceWorker } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';
import { provideCommonMetaServices} from '@ballware/common-meta-services';
import { provideRendererCommonsServices } from '@ballware/renderer-commons';
import { LayoutModule } from '@angular/cdk/layout';
import { ENV, RuntimeEnv } from './env';

export const sharedConfig: ApplicationConfig = {
    providers: [
      {
        provide: DX_RENDERFACTORY_CONFIG,
        useFactory: (env: RuntimeEnv) => ({
          licenseKey: env.BALLWARE_DEVEXTREMEKEY
        }),
        deps: [ENV]
      },
      {
        provide: IDENTITY_KEYCLOAK_REST_API_CONFIG,
        useFactory: (env: RuntimeEnv) => ({
          serviceBaseUrl: env.BALLWARE_IDENTITYURL
        } as IdentityKeycloakRestApiConfig),
        deps: [ENV]
      },
      {
        provide: META_REST_API_CONFIG,
        useFactory: (env: RuntimeEnv) => ({
          metaServiceBaseUrl: env.BALLWARE_METAURL,
          documentServiceBaseUrl: env.BALLWARE_DOCUMENTURL,
          tenantServiceBaseUrl: env.BALLWARE_TENANTURL,
          mlServiceBaseUrl: env.BALLWARE_MLURL,
          storageServiceBaseUrl: env.BALLWARE_STORAGEURL
        } as MetaRestApiConfig),
        deps: [ENV]
      },
      {
        provide: DOCUMENT_API_CONFIG,
        useFactory: (env: RuntimeEnv) => ({
          baseUrl: env.BALLWARE_DOCUMENTURL,
          signonUrl: env.BALLWARE_DOCUMENT_SIGNON_URL,
          designerUrl: env.BALLWARE_DOCUMENT_DESIGNER_URL,
          viewerUrl: env.BALLWARE_DOCUMENT_VIEWER_URL
        } as DocumentRestApiConfig),
        deps: [ENV]
      },
      {
        provide: GENERIC_API_CONFIG,
        useFactory: (env: RuntimeEnv) => ({
          identityServiceBaseUrl: env.BALLWARE_IDENTITYURL,
          metaServiceBaseUrl: env.BALLWARE_METAURL,
          tenantServiceBaseUrl: env.BALLWARE_TENANTURL,
          genericServiceBaseUrl: env.BALLWARE_GENERICURL,
          documentServiceBaseUrl: env.BALLWARE_DOCUMENTURL,
          mlServiceBaseUrl: env.BALLWARE_MLURL,
          storageServiceBaseUrl: env.BALLWARE_STORAGEURL
        } as GenericRestApiConfig),
        deps: [ENV]
      },
        importProvidersFrom(LayoutModule),
        provideHttpClient(withInterceptors([BearerTokenInterceptor]), withFetch()),
        provideStore(routerReducer),
        provideRouterStore(),
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
        provideCommonMetaServices(),
        provideNgrxOidcIdentityService(),
        provideNgrxMetaServices(),
        provideRendererCommonsServices(),
        provideDxRenderFactoryComponents(),
        provideDxRenderFactoryRoutes(),
        provideIdentityKeycloakRestApi(),
        provideMetaBackendRestApi(),
        provideDocumentBackendRestApi(),
        provideGenericBackendRestApi()
    ]
};
