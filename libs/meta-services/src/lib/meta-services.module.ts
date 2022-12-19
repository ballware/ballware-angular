import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from './settings.service';
import { DefaultSettingsService } from './implementation/default.settings.service';
import { MetaServiceFactory } from './meta.service.factory';
import { DefaultMetaServiceFactory } from './implementation/default.service.factory';
import { HttpClient } from '@angular/common/http';
import { ApiServiceFactory } from '@ballware/meta-api';
import { OAuthService } from 'angular-oauth2-oidc';
import { I18NextPipe } from 'angular-i18next';
import { TenantService } from './tenant.service';
import { AuthService } from './auth.service';

export * from './auth.service';
export * from './attachment.service';
export * from './crud.service';
export * from './edit.service';
export * from './lookup.service';
export * from './meta.service';
export * from './responsive.service';
export * from './settings.service';
export * from './tenant.service';
export * from './page.service';
export * from './editmodes';
export * from './edititemref';
export * from './toolbaritemref';
export * from './meta.service.factory';

export interface MetaServicesModuleConfig {
  version: string,
  googlekey: string,
  identityIssuer: string,
  identityClient: string,
  identityScopes: string,
  identityTenantClaim: string,
  identityUsernameClaim: string,
  identityProfileUrl: string
}

@NgModule({
  imports: [CommonModule],
})
export class MetaServicesModule {
  static forRoot(config: MetaServicesModuleConfig): ModuleWithProviders<MetaServicesModule> {
    return {
      ngModule: MetaServicesModule,
      providers: [
        {
          provide: SettingsService,
          useFactory: () => new DefaultSettingsService(config.version, config.googlekey, config.identityIssuer, config.identityClient, config.identityScopes, config.identityTenantClaim, config.identityUsernameClaim, config.identityProfileUrl)
        },
        {
          provide: MetaServiceFactory,
          useFactory: (httpClient: HttpClient, 
            apiServiceFactory: ApiServiceFactory, 
            settingsService: SettingsService, 
            oauthService: OAuthService, 
            translationPipe: I18NextPipe) => new DefaultMetaServiceFactory(httpClient, apiServiceFactory, settingsService, oauthService, translationPipe),
          deps: [
            HttpClient,
            ApiServiceFactory,
            SettingsService,
            OAuthService,
            I18NextPipe
          ]
        },
        {
          provide: AuthService,
          useFactory: (metaServiceFactory: MetaServiceFactory) => metaServiceFactory.createAuthService(),
          deps: [MetaServiceFactory]
        },
        {
          provide: TenantService,
          useFactory: (metaServiceFactory: MetaServiceFactory, authService: AuthService) => metaServiceFactory.createTenantService(authService),
          deps: [MetaServiceFactory, AuthService]
        }
      ]
    };
  }
}
