import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { OAuthService } from 'angular-oauth2-oidc';
import { ComponentFeatureModule } from './component';
import { IdentityEffectsModule, IdentityFeatureModule } from './identity';
import { IdentityService } from './identity.service';
import { IdentityServiceProxy } from './identity/identity.proxy';
import { DefaultMetaServiceFactory } from './implementation/default.service.factory';
import { MetaServiceFactory } from './meta.service.factory';
import { NotificationFeatureModule } from './notification';
import { NOTIFICATION_SERVICE, NotificationService } from './notification.service';
import { NotificationServiceProxy } from './notification/notification.proxy';
import { SettingsFeatureModule } from './settings';
import { SETTINGS_SERVICE } from './settings.service';
import { SettingsServiceProxy } from './settings/settings.proxy';
import { TenantEffectsModule, TenantFeatureModule } from './tenant';
import { TenantService } from './tenant.service';
import { TenantServiceProxy } from './tenant/tenant.proxy';
import { ToolbarEffectsModule, ToolbarFeatureModule } from './toolbar';
import { ToolbarService } from './toolbar.service';
import { ToolbarServiceProxy } from './toolbar/toolbar.proxy';

export * from './attachment.service';
export * from './crud.service';
export * from './edit.service';
export * from './edititemref';
export * from './editmodes';
export * from './identity.service';
export * from './lookup.service';
export * from './masterdetail.service';
export * from './meta.service';
export * from './meta.service.factory';
export * from './notification.service';
export * from './page.service';
export * from './responsive.service';
export * from './settings.service';
export * from './statistic.service';
export * from './tenant.service';
export * from './toolbar.service';
export * from './toolbaritemref';

@NgModule({
  imports: [
    CommonModule,    
    SettingsFeatureModule,
    NotificationFeatureModule,
    IdentityFeatureModule,
    IdentityEffectsModule,
    TenantFeatureModule,
    TenantEffectsModule,
    ToolbarFeatureModule,
    ToolbarEffectsModule,
    ComponentFeatureModule
  ],
})
export class MetaServicesModule {
  static forRoot(): ModuleWithProviders<MetaServicesModule> {
    return {
      ngModule: MetaServicesModule,
      providers: [  
        {
          provide: SETTINGS_SERVICE,
          useFactory: (store: Store) => new SettingsServiceProxy(store),
          deps: [ Store ]
        },         
        {
          provide: NOTIFICATION_SERVICE,
          useFactory: (store: Store) => new NotificationServiceProxy(store),
          deps: [ Store ]
        },          
        {
          provide: IdentityService,
          useFactory: (store: Store) => new IdentityServiceProxy(store),
          deps: [ Store ]
        },  
        {
          provide: TenantService,
          useFactory: (store: Store) => new TenantServiceProxy(store),
          deps: [ Store ]
        },          
        {
          provide: ToolbarService,
          useFactory: (store: Store) => new ToolbarServiceProxy(store),
          deps: [ Store ]
        },
        {
          provide: MetaServiceFactory,
          useFactory: (
            store: Store,
            httpClient: HttpClient, 
            router: Router,
            apiServiceFactory: ApiServiceFactory, 
            notificationService: NotificationService,
            oauthService: OAuthService, 
            translationPipe: I18NextPipe,
            identityService: IdentityService,
            tenantService: TenantService,
            toolbarService: ToolbarService) => new DefaultMetaServiceFactory(store, httpClient, router, apiServiceFactory, oauthService, translationPipe, notificationService, identityService, tenantService, toolbarService),
          deps: [
            Store,            
            HttpClient,
            Router,
            ApiServiceFactory,
            NOTIFICATION_SERVICE,
            OAuthService,
            I18NextPipe,
            IdentityService,
            TenantService,
            ToolbarService
          ]
        }
      ]
    };
  }
}
