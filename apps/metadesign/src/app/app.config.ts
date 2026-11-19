import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideEffects } from '@ngrx/effects';
import { LayoutModule } from '@angular/cdk/layout';
import {
  DOCUMENT_API_CONFIG,
  GENERIC_API_CONFIG,
  IDENTITY_KEYCLOAK_REST_API_CONFIG,
  META_REST_API_CONFIG,
  provideDocumentBackendRestApi,
  provideGenericBackendRestApi,
  provideIdentityKeycloakRestApi,
  provideMetaBackendRestApi,
} from '@ballware/rest-meta-api';
import { DX_RENDERFACTORY_CONFIG, provideDxRenderFactoryComponents } from '@ballware/dx-renderer';
import { provideCommonMetaServices } from '@ballware/common-meta-services';
import { provideRendererCommonsServices } from '@ballware/renderer-commons';
import { provideNgrxMetaServices, provideNgrxStaticUserIdentityService } from '@ballware/ngrx-meta-services';
import { InspectorComponent } from './inspector/inspector.component';
import { requestLogInterceptor } from './request-log';
import { routes } from './routes';

export interface SandboxBootstrap {
  tenant: Record<string, unknown>;
  user: Record<string, unknown>;
  revision?: string;
}

export const createSandboxConfig = (bootstrap: SandboxBootstrap): ApplicationConfig => {
  const tenantId = (bootstrap.tenant['Id'] ?? 'e2e').toString();
  const userName = (bootstrap.user['Name'] ?? bootstrap.user['Id'] ?? 'unknown user').toString();

  return {
    providers: [
      {
        provide: DX_RENDERFACTORY_CONFIG,
        useValue: {
          licenseKey: (window as unknown as Record<string, unknown>)['BALLWARE_DEVEXTREMEKEY'] as string ?? ''
        }
      },
      {
        provide: IDENTITY_KEYCLOAK_REST_API_CONFIG,
        useValue: { serviceBaseUrl: '/identity' }
      },
      {
        provide: META_REST_API_CONFIG,
        useValue: {
          metaServiceBaseUrl: '/meta',
          documentServiceBaseUrl: '/document',
          tenantServiceBaseUrl: '/tenant',
          mlServiceBaseUrl: '/ml',
          storageServiceBaseUrl: '/storage'
        }
      },
      {
        provide: DOCUMENT_API_CONFIG,
        useValue: {
          baseUrl: '/document',
          signonUrl: '/document/signon',
          designerUrl: '/document/designer',
          viewerUrl: '/document/viewer'
        }
      },
      {
        provide: GENERIC_API_CONFIG,
        useValue: {
          identityServiceBaseUrl: '/identity',
          metaServiceBaseUrl: '/meta',
          tenantServiceBaseUrl: '/tenant',
          genericServiceBaseUrl: '/generic',
          documentServiceBaseUrl: '/document',
          mlServiceBaseUrl: '/ml',
          storageServiceBaseUrl: '/storage'
        }
      },
      provideHttpClient(withInterceptors([requestLogInterceptor])),
      importProvidersFrom(LayoutModule),
      provideStore(routerReducer),
      provideRouterStore(),
      provideEffects(),
      provideCommonMetaServices(),
      provideNgrxMetaServices(),
      provideRendererCommonsServices(),
      provideDxRenderFactoryComponents(),
      provideIdentityKeycloakRestApi(),
      provideMetaBackendRestApi(),
      provideDocumentBackendRestApi(),
      provideGenericBackendRestApi(),
      provideNgrxStaticUserIdentityService(bootstrap.user, tenantId, userName),
      provideRouter(
        [
          { path: 'inspector', component: InspectorComponent },
          ...routes
        ],
        withComponentInputBinding()
      )
    ]
  };
};
