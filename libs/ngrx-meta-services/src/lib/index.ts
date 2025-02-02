import { HttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Router } from '@angular/router';
import { GENERIC_ENTITY_API_FACTORY, GenericEntityApiFactory, IDENTITY_ROLE_API, IDENTITY_USER_API, IdentityRoleApi, IdentityUserApi, META_ATTACHMENT_API_FACTORY, META_ENTITY_API, META_LOOKUP_API, META_PAGE_API, META_PICKVALUE_API, META_PROCESSINGSTATE_API, META_STATISTIC_API, MetaAttachmentApiFactory, MetaEntityApi, MetaLookupApi, MetaPageApi, MetaPickvalueApi, MetaProcessingstateApi, MetaStatisticApi } from '@ballware/meta-api';
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
import { ATTACHMENT_SERVICE_FACTORY, CRUD_SERVICE_FACTORY, EDIT_SERVICE_FACTORY, IDENTITY_SERVICE, IdentityService, IDLE_SERVICE, INTERACTION_SERVICE, InteractionService, LOOKUP_SERVICE_FACTORY, LookupService, META_SERVICE_FACTORY, MetaService, NOTIFICATION_SERVICE, NotificationService, PAGE_SERVICE_FACTORY, RESPONSIVE_SERVICE, SETTINGS_SERVICE, STATISTIC_SERVICE_FACTORY, TENANT_SERVICE, TenantService, TOOLBAR_SERVICE, ToolbarService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { DefaultResponsiveService } from './responsive.service';
import { DefaultIdleService } from './idle.service';
import { DefaultInteractionService } from './interaction.service';

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
        useFactory: () => new DefaultResponsiveService(),
        deps: []
      },      
      {
        provide: IDLE_SERVICE,
        useFactory: () => new DefaultIdleService(),
        deps: []
      },
      {
        provide: INTERACTION_SERVICE,
        useFactory: () => new DefaultInteractionService(),
        deps: []
      },
      {
        provide: ATTACHMENT_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          notificationService: NotificationService, 
          attachmentApiFactory: MetaAttachmentApiFactory, 
          translator: Translator
        ) => () => new AttachmentStore(store, notificationService, attachmentApiFactory, translator),
        deps: [ Store, NOTIFICATION_SERVICE, META_ATTACHMENT_API_FACTORY, TRANSLATOR ]
      },
      {
        provide: LOOKUP_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          userApi: IdentityUserApi,
          roleApi: IdentityRoleApi,
          lookupApi: MetaLookupApi,
          pickvalueApi: MetaPickvalueApi,
          processingstateApi: MetaProcessingstateApi
        ) => () => new LookupStore(store, userApi, roleApi, lookupApi, pickvalueApi, processingstateApi),
        deps: [ Store, IDENTITY_USER_API, IDENTITY_ROLE_API, META_LOOKUP_API, META_PICKVALUE_API, META_PROCESSINGSTATE_API ]
      },
      {
        provide: META_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          metaEntityApi: MetaEntityApi,
          genericEntityApiFactory: GenericEntityApiFactory,
          httpClient: HttpClient, 
          translator: Translator,
          identityService: IdentityService,
          tenantService: TenantService            
        ) => (lookupService: LookupService) => new MetaStore(store, httpClient, translator, metaEntityApi, genericEntityApiFactory, identityService, tenantService, lookupService),
        deps: [ 
          Store, 
          META_ENTITY_API,
          GENERIC_ENTITY_API_FACTORY,
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
          store: Store,
          interactionService: InteractionService
        ) => (metaService: MetaService) => new EditStore(store, interactionService, metaService),
        deps: [ 
          Store, INTERACTION_SERVICE
        ]
      },             
      {
        provide: STATISTIC_SERVICE_FACTORY,
        useFactory: (
          store: Store,
          httpClient: HttpClient,
          metaStatisticApi: MetaStatisticApi,
          identityService: IdentityService
        ) => (lookupService: LookupService) => new StatisticStore(store, httpClient, metaStatisticApi, identityService, lookupService),
        deps: [
          Store,
          HttpClient,
          META_STATISTIC_API,
          IDENTITY_SERVICE
        ]
      },
      {
        provide: PAGE_SERVICE_FACTORY,
        useFactory: (
          store: Store, 
          metaPageApi: MetaPageApi,
          httpClient: HttpClient, 
          identityService: IdentityService,
          tenantService: TenantService,
          toolbarService: ToolbarService
        ) => (router: Router, lookupService: LookupService) => new PageStore(store, httpClient, router, identityService, tenantService, toolbarService, lookupService, metaPageApi),
        deps: [
          Store, 
          META_PAGE_API,
          HttpClient,
          IDENTITY_SERVICE,
          TENANT_SERVICE,
          TOOLBAR_SERVICE
        ]
      }
    ]
  );
}
