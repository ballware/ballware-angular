import { HttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { provideComponentFeature } from './component';
import { provideIdentityEffects, provideIdentityFeature } from './identity';
import { IdentityServiceProxy } from './identity/identity.proxy';
import { provideNotificationFeature } from './notification';
import { NotificationServiceProxy } from './notification/notification.proxy';
import { provideSettingsFeature } from './settings';
import { SettingsServiceProxy } from './settings/settings.proxy';
import { provideTenantEffects, provideTenantFeature } from './tenant';
import { TenantServiceProxy } from './tenant/tenant.proxy';
import { provideToolbarEffects, provideToolbarFeature } from './toolbar';
import { ToolbarServiceProxy } from './toolbar/toolbar.proxy';
import { AttachmentStore } from './attachment/attachment.store';
import { LookupStore } from './lookup/lookup.store';
import { MetaStore } from './meta/meta.store';
import { PageStore } from './page/page.store';
import { CrudStore } from './crud/crud.store';
import { StatisticStore } from './statistic/statistic.store';
import { EditStore } from './edit/edit.store';
import { ATTACHMENT_SERVICE_FACTORY, CRUD_SERVICE_FACTORY, EDIT_SERVICE_FACTORY, IDENTITY_SERVICE, IdentityService, LOOKUP_SERVICE_FACTORY, LookupService, META_SERVICE_FACTORY, MetaService, NOTIFICATION_SERVICE, NotificationService, PAGE_SERVICE_FACTORY, RESPONSIVE_SERVICE, SETTINGS_SERVICE, STATISTIC_SERVICE_FACTORY, TENANT_SERVICE, TenantService, TOOLBAR_SERVICE, ToolbarService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { ResponsiveServiceImplementation } from './responsive.service';

export function provideNgrxMetaServices(): EnvironmentProviders {
  return makeEnvironmentProviders(    
    [  
      provideSettingsFeature(),
      provideNotificationFeature(),
      provideIdentityFeature(),
      provideIdentityEffects(),
      provideTenantFeature(),
      provideTenantEffects(),
      provideToolbarFeature(),
      provideToolbarEffects(),
      provideComponentFeature(),
      {
        provide: TRANSLATOR,
        useFactory: (pipe: I18NextPipe): Translator => (key, options) => pipe.transform(key, options),
        deps: [
          I18NextPipe
        ]
      },
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
        provide: RESPONSIVE_SERVICE,
        useFactory: () => new ResponsiveServiceImplementation(),
        deps: []
      },
      {
        provide: ATTACHMENT_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          notificationService: NotificationService, 
          apiServiceFactory: ApiServiceFactory, 
          translator: Translator
        ) => () => new AttachmentStore(store, notificationService, apiServiceFactory.createMetaApi(), translator),
        deps: [ Store, NOTIFICATION_SERVICE, ApiServiceFactory, TRANSLATOR ]
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
          translator: Translator,
          identityService: IdentityService,
          tenantService: TenantService            
        ) => (lookupService: LookupService) => new MetaStore(store, httpClient, translator, apiServiceFactory.createMetaApi(), identityService, tenantService, lookupService),
        deps: [ 
          Store, 
          ApiServiceFactory,
          HttpClient,
          TRANSLATOR,
          IDENTITY_SERVICE,
          TENANT_SERVICE
        ]
      },
      {
        provide: CRUD_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          translator: Translator,         
          notificationService: NotificationService           
        ) => (router: Router, metaService: MetaService) => new CrudStore(store, metaService, notificationService, translator, router),
        deps: [ 
          Store, 
          TRANSLATOR,
          NOTIFICATION_SERVICE 
        ]
      },        
      {
        provide: EDIT_SERVICE_FACTORY,
        useFactory: (
          store: Store
        ) => (metaService: MetaService) => new EditStore(store, metaService),
        deps: [ 
          Store
        ]
      },             
      {
        provide: STATISTIC_SERVICE_FACTORY,
        useFactory: (
          store: Store,
          httpClient: HttpClient,
          apiServiceFactory: ApiServiceFactory,
          identityService: IdentityService
        ) => (lookupService: LookupService) => new StatisticStore(store, httpClient, apiServiceFactory.createMetaApi(), identityService, lookupService),
        deps: [
          Store,
          HttpClient,
          ApiServiceFactory,
          IDENTITY_SERVICE
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
      }
    ]
  );
}
