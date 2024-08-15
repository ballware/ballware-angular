import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { ComponentFeatureModule } from './component';
import { IdentityEffectsModule, IdentityFeatureModule } from './identity';
import { IDENTITY_SERVICE, IdentityService } from './identity.service';
import { IdentityServiceProxy } from './identity/identity.proxy';
import { DefaultMetaServiceFactory } from './implementation/default.service.factory';
import { ServiceFactory } from './meta.service.factory';
import { NotificationFeatureModule } from './notification';
import { NOTIFICATION_SERVICE, NotificationService } from './notification.service';
import { NotificationServiceProxy } from './notification/notification.proxy';
import { SettingsFeatureModule } from './settings';
import { SETTINGS_SERVICE } from './settings.service';
import { SettingsServiceProxy } from './settings/settings.proxy';
import { TenantEffectsModule, TenantFeatureModule } from './tenant';
import { TENANT_SERVICE, TenantService } from './tenant.service';
import { TenantServiceProxy } from './tenant/tenant.proxy';
import { ToolbarEffectsModule, ToolbarFeatureModule } from './toolbar';
import { TOOLBAR_SERVICE, ToolbarService } from './toolbar.service';
import { ToolbarServiceProxy } from './toolbar/toolbar.proxy';
import { ATTACHMENT_SERVICE_FACTORY } from './attachment.service';
import { AttachmentStore } from './attachment/attachment.store';
import { LOOKUP_SERVICE_FACTORY, LookupService } from './lookup.service';
import { LookupStore } from './lookup/lookup.store';
import { META_SERVICE_FACTORY } from './meta.service';
import { MetaStore } from './meta/meta.store';
import { PAGE_SERVICE_FACTORY } from './page.service';
import { PageStore } from './page/page.store';

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
          provide: IDENTITY_SERVICE,
          useFactory: (store: Store) => new IdentityServiceProxy(store),
          deps: [ Store ]
        },  
        {
          provide: TENANT_SERVICE,
          useFactory: (store: Store) => new TenantServiceProxy(store),
          deps: [ Store ]
        },          
        {
          provide: TOOLBAR_SERVICE,
          useFactory: (store: Store) => new ToolbarServiceProxy(store),
          deps: [ Store ]
        },
        {
          provide: ATTACHMENT_SERVICE_FACTORY,
          useFactory: (
            store: Store, 
            notificationService: NotificationService, 
            apiServiceFactory: ApiServiceFactory, 
            translationPipe: I18NextPipe
          ) => () => new AttachmentStore(store, notificationService, apiServiceFactory.createMetaApi(), translationPipe),
          deps: [ Store, NOTIFICATION_SERVICE, ApiServiceFactory, I18NextPipe ]
        },
        {
          provide: LOOKUP_SERVICE_FACTORY,
          useFactory: (
            store: Store, 
            apiServiceFactory: ApiServiceFactory            
          ) => () => new LookupStore(store, apiServiceFactory.createIdentityApi(), apiServiceFactory.createMetaApi()),
          deps: [ Store, ApiServiceFactory ]
        },
        {
          provide: META_SERVICE_FACTORY,
          useFactory: (
            store: Store, 
            apiServiceFactory: ApiServiceFactory,
            httpClient: HttpClient, 
            translationPipe: I18NextPipe,
            identityService: IdentityService,
            tenantService: TenantService            
          ) => (lookupService: LookupService) => new MetaStore(store, httpClient, translationPipe, apiServiceFactory.createMetaApi(), identityService, tenantService, lookupService),
          deps: [ 
            Store, 
            ApiServiceFactory,
            HttpClient,
            I18NextPipe,
            IDENTITY_SERVICE,
            TENANT_SERVICE
          ]
        },
        {
          provide: PAGE_SERVICE_FACTORY,
          useFactory: (
            store: Store, 
            apiServiceFactory: ApiServiceFactory,
            httpClient: HttpClient, 
            identityService: IdentityService,
            tenantService: TenantService,
            toolbarService: ToolbarService
          ) => (router: Router, lookupService: LookupService) => new PageStore(store, httpClient, router, identityService, tenantService, toolbarService, lookupService, apiServiceFactory.createMetaApi()),
          deps: [
            Store, 
            ApiServiceFactory,
            HttpClient,
            IDENTITY_SERVICE,
            TENANT_SERVICE,
            TOOLBAR_SERVICE
          ]
        },
        {
          provide: ServiceFactory,
          useFactory: (
            store: Store,
            httpClient: HttpClient, 
            router: Router,
            apiServiceFactory: ApiServiceFactory, 
            notificationService: NotificationService,
            translationPipe: I18NextPipe,
            identityService: IdentityService,
            tenantService: TenantService,
            toolbarService: ToolbarService) => new DefaultMetaServiceFactory(store, httpClient, router, apiServiceFactory, translationPipe, notificationService, identityService, tenantService, toolbarService),
          deps: [
            Store,            
            HttpClient,
            Router,
            ApiServiceFactory,
            NOTIFICATION_SERVICE,
            I18NextPipe,
            IDENTITY_SERVICE,
            TENANT_SERVICE,
            TOOLBAR_SERVICE
          ]
        }
      ]
    };
  }
}
