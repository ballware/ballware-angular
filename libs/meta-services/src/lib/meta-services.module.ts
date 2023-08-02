import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaServiceFactory } from './meta.service.factory';
import { DefaultMetaServiceFactory } from './implementation/default.service.factory';
import { HttpClient } from '@angular/common/http';
import { ApiServiceFactory } from '@ballware/meta-api';
import { OAuthService } from 'angular-oauth2-oidc';
import { I18NextPipe } from 'angular-i18next';
import { Store } from '@ngrx/store';
import { IdentityEffectsModule, IdentityFeatureModule } from './identity';
import { SettingsFeatureModule } from './settings';
import { TenantEffectsModule, TenantFeatureModule } from './tenant';
import { SettingsService } from './settings.service';
import { SettingsServiceStore } from './settings/settings.service.store';
import { IdentityService } from './identity.service';
import { IdentityServiceStore } from './identity/identity.service.store';
import { TenantService } from './tenant.service';
import { TenantServiceStore } from './tenant/tenant.service.store';

export * from './settings.service';
export * from './identity.service';
export * from './tenant.service';
export * from './attachment.service';
export * from './crud.service';
export * from './edit.service';
export * from './lookup.service';
export * from './meta.service';
export * from './responsive.service';
export * from './page.service';
export * from './editmodes';
export * from './edititemref';
export * from './toolbaritemref';
export * from './meta.service.factory';

@NgModule({
  imports: [
    CommonModule,    
    SettingsFeatureModule,
    IdentityFeatureModule,
    IdentityEffectsModule,
    TenantFeatureModule,
    TenantEffectsModule
  ],
})
export class MetaServicesModule {
  static forRoot(): ModuleWithProviders<MetaServicesModule> {
    return {
      ngModule: MetaServicesModule,
      providers: [   
        {
          provide: SettingsService,
          useFactory: (store: Store) => new SettingsServiceStore(store),
          deps: [ Store ]
        },    
        {
          provide: IdentityService,
          useFactory: (store: Store) => new IdentityServiceStore(store),
          deps: [ Store ]
        },  
        {
          provide: TenantService,
          useFactory: (store: Store) => new TenantServiceStore(store),
          deps: [ Store ]
        },          
        {
          provide: MetaServiceFactory,
          useFactory: (
            store: Store,
            httpClient: HttpClient, 
            apiServiceFactory: ApiServiceFactory, 
            oauthService: OAuthService, 
            translationPipe: I18NextPipe,
            identityService: IdentityService,
            tenantService: TenantService) => new DefaultMetaServiceFactory(store, httpClient, apiServiceFactory, oauthService, translationPipe, identityService, tenantService),
          deps: [
            Store,            
            HttpClient,
            ApiServiceFactory,
            OAuthService,
            I18NextPipe,
            IdentityService,
            TenantService
          ]
        }
      ]
    };
  }
}
