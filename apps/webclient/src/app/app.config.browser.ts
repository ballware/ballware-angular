import { ENV, RuntimeEnv } from './env';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { sharedConfig } from './app.config';
import {
  OIDC_IDENTITY_CONFIG,
  OidcIdentityConfig,
  provideNgrxOidcIdentityService,
  provideNgrxSessionIdentityService,
} from '@ballware/ngrx-meta-services';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';
import {
  provideDxRenderFactoryBrowserRoutes
} from '@ballware/dx-renderer';
import { provideIdentitySessionRestApi } from '@ballware/rest-meta-api';

declare let window :any;

export const browserConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENV,
      useValue: window.ENV as RuntimeEnv,
    },
    {
      provide: OIDC_IDENTITY_CONFIG,
      useFactory: (env: RuntimeEnv) =>
        ({
          issuer: env.BALLWARE_IDENTITYURL,
          client: env.BALLWARE_CLIENTID,
          scopes: env.BALLWARE_IDENTITYSCOPES,
          tenantClaim: env.BALLWARE_TENANTCLAIM,
          usernameClaim: env.BALLWARE_USERNAMECLAIM,
          profileUrl: env.BALLWARE_ACCOUNTURL,
          accessTokenAutoRefresh: env.BALLWARE_IDENTITYAUTOREFRESH === '1',
        } as OidcIdentityConfig),
      deps: [ENV],
    },
    provideHttpClient(),
    provideIdentitySessionRestApi(),
    provideNgrxSessionIdentityService(),
    provideDxRenderFactoryBrowserRoutes(),
  ],
};

export const config = mergeApplicationConfig(sharedConfig, browserConfig);
