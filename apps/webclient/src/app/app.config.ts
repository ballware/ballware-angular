import { ApplicationConfig } from '@angular/core';

import { provideNgrxMetaServices } from '@ballware/ngrx-meta-services';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideIdentityKeycloakRestApi, provideMetaBackendRestApi, provideGenericBackendRestApi, provideDocumentBackendRestApi } from '@ballware/rest-meta-api';
import { provideDxRenderFactoryComponents, provideDxRenderFactoryRoutes } from '@ballware/dx-renderer';
import { provideServiceWorker } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';
import { provideCommonMetaServices} from '@ballware/common-meta-services';
import { provideRendererCommonsServices } from '@ballware/renderer-commons';

declare let window :any;

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([BearerTokenInterceptor])),
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
        provideNgrxMetaServices(),
        provideRendererCommonsServices(),
        provideDxRenderFactoryComponents({ licenseKey: window.ENV.BALLWARE_DEVEXTREMEKEY }),
        provideDxRenderFactoryRoutes(),
        provideIdentityKeycloakRestApi(window.ENV.BALLWARE_IDENTITYURL), 
        provideMetaBackendRestApi(
            window.ENV.BALLWARE_METAURL, 
            window.ENV.BALLWARE_DOCUMENTURL,
            window.ENV.BALLWARE_TENANTURL, 
            window.ENV.BALLWARE_MLURL,
            window.ENV.BALLWARE_STORAGEURL), 
        provideDocumentBackendRestApi(
            window.ENV.BALLWARE_DOCUMENTURL, 
            window.ENV.BALLWARE_DOCUMENT_SIGNON_URL,
            window.ENV.BALLWARE_DOCUMENT_DESIGNER_URL,
            window.ENV.BALLWARE_DOCUMENT_VIEWER_URL),
        provideGenericBackendRestApi(
            window.ENV.BALLWARE_METAURL, 
            window.ENV.BALLWARE_TENANTURL, 
            window.ENV.BALLWARE_GENERICURL, 
            window.ENV.BALLWARE_DOCUMENTURL, 
            window.ENV.BALLWARE_MLURL,
            window.ENV.BALLWARE_STORAGEURL)        
    ]
};