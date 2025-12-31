import { HttpClient } from "@angular/common/http";
import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { GENERIC_ENTITY_API_FACTORY, IDENTITY_ROLE_API, IDENTITY_USER_API, META_ATTACHMENT_API_FACTORY, META_DOCUMENT_API, META_DOCUMENTATION_API, META_ENTITY_API, META_LOOKUP_API, META_MLMODEL_API, META_NOTIFICATION_API, META_PAGE_API, META_PICKVALUE_API, META_PROCESSINGSTATE_API, META_STATISTIC_API, META_SUBSCRIPTION_API, META_TENANT_API } from "@ballware/meta-api";
import { createKeycloakUserApi } from "./user";
import { createKeycloakRoleApi } from "./role";
import { createMetaBackendDocumentApi } from "./document";
import { createMetaBackendDocumentationApi } from "./documentation";
import { createMetaBackendEntityApi } from "./entity";
import { createMetaBackendLookupApi } from "./lookup";
import { createMetaBackendPageApi } from "./page";
import { createMetaBackendPickvalueApi } from "./pickvalue";
import { createMetaBackendProcessingstateApi } from "./processingstate";
import { createMetaBackendStatisticApi } from "./statistic";
import { createMetaBackendMlModelApi } from "./mlmodel";
import { createMetaBackendNotificationApi } from "./notification";
import { createMetaBackendSubscriptionApi } from "./subscription";
import { createMetaBackendTenantApi } from "./tenant";
import { createGenericBackendEntityApi } from "./genericentity";
import { createMetaBackendAttachmentApi } from "./attachment";

export { EntityMetadata, EntityCustomScripts, compileEntityMetadata } from './entity';
export { PageData, PageCustomScripts, compilePage } from './page';

export interface IdentityKeycloakRestApiConfig {
    serviceBaseUrl: string
}

export const IDENTITY_KEYCLOAK_REST_API_CONFIG = new InjectionToken<IdentityKeycloakRestApiConfig>('DxRenderFactoryConfig');


export function provideIdentityKeycloakRestApi(): EnvironmentProviders {
  return makeEnvironmentProviders(
    [
        {
            provide: IDENTITY_USER_API,
            useFactory: (client: HttpClient, config: IdentityKeycloakRestApiConfig) => createKeycloakUserApi(client, config.serviceBaseUrl),
            deps: [ HttpClient, IDENTITY_KEYCLOAK_REST_API_CONFIG ]
        },
        {
            provide: IDENTITY_ROLE_API,
            useFactory: (client: HttpClient, config: IdentityKeycloakRestApiConfig) => createKeycloakRoleApi(client, config.serviceBaseUrl),
            deps: [ HttpClient, IDENTITY_KEYCLOAK_REST_API_CONFIG ]
        },
    ]);
}

export interface MetaRestApiConfig {
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string,
  tenantServiceBaseUrl: string,
  mlServiceBaseUrl: string,
  storageServiceBaseUrl: string
}

export const META_REST_API_CONFIG = new InjectionToken<MetaRestApiConfig>('MetaRestApiConfig');


export function provideMetaBackendRestApi(): EnvironmentProviders {

    return makeEnvironmentProviders(
    [
        {
            provide: META_ATTACHMENT_API_FACTORY,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => (tenant: string, entity: string, owner: string) => createMetaBackendAttachmentApi(client, config.storageServiceBaseUrl, tenant, entity, owner),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_DOCUMENTATION_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendDocumentationApi(client, config.metaServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_ENTITY_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendEntityApi(client, config.metaServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_LOOKUP_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendLookupApi(client, config.metaServiceBaseUrl, config.tenantServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_PAGE_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendPageApi(client, config.metaServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_PICKVALUE_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendPickvalueApi(client, config.metaServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_PROCESSINGSTATE_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendProcessingstateApi(client, config.metaServiceBaseUrl, config.tenantServiceBaseUrl, config.documentServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_STATISTIC_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendStatisticApi(client, config.metaServiceBaseUrl, config.tenantServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_MLMODEL_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendMlModelApi(client, config.metaServiceBaseUrl, config.mlServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
        {
            provide: META_TENANT_API,
            useFactory: (client: HttpClient, config: MetaRestApiConfig) => createMetaBackendTenantApi(client, config.metaServiceBaseUrl),
            deps: [ HttpClient, META_REST_API_CONFIG ]
        },
    ]);
}

export interface DocumentRestApiConfig {
  baseUrl: string,
  signonUrl: string,
  designerUrl: string,
  viewerUrl: string
}

export const DOCUMENT_API_CONFIG = new InjectionToken<DocumentRestApiConfig>('DocumentRestApiConfig');

export function provideDocumentBackendRestApi(): EnvironmentProviders {

    return makeEnvironmentProviders(
    [
        {
            provide: META_DOCUMENT_API,
            useFactory: (client: HttpClient, config: DocumentRestApiConfig) => createMetaBackendDocumentApi(client, config.baseUrl, config.signonUrl, config.designerUrl, config.viewerUrl ),
            deps: [ HttpClient, DOCUMENT_API_CONFIG ]
        },
        {
            provide: META_NOTIFICATION_API,
            useFactory: (client: HttpClient, config: DocumentRestApiConfig) => createMetaBackendNotificationApi(client, config.baseUrl),
            deps: [ HttpClient, DOCUMENT_API_CONFIG ]
        },
        {
            provide: META_SUBSCRIPTION_API,
            useFactory: (client: HttpClient, config: DocumentRestApiConfig) => createMetaBackendSubscriptionApi(client, config.baseUrl),
            deps: [ HttpClient, DOCUMENT_API_CONFIG ]
        },
    ]);
}

export interface GenericRestApiConfig {
  identityServiceBaseUrl: string,
  metaServiceBaseUrl: string,
  tenantServiceBaseUrl: string,
  genericServiceBaseUrl: string,
  documentServiceBaseUrl: string,
  mlServiceBaseUrl: string,
  storageServiceBaseUrl: string
}

export const GENERIC_API_CONFIG = new InjectionToken<GenericRestApiConfig>('GenericRestApiConfig');


export function provideGenericBackendRestApi()
    : EnvironmentProviders {

    return makeEnvironmentProviders(
      [
          {
              provide: GENERIC_ENTITY_API_FACTORY,
              useFactory: (client: HttpClient, config: GenericRestApiConfig) => (entityBaseUrl: string) => createGenericBackendEntityApi(client,
                entityBaseUrl
                    .replace('{identity}', config.identityServiceBaseUrl + "/")
                    .replace('{meta}', config.metaServiceBaseUrl + "/")
                    .replace('{tenant}', config.tenantServiceBaseUrl + "/")
                    .replace('{generic}', config.genericServiceBaseUrl + "/")
                    .replace('{document}', config.documentServiceBaseUrl + "/")
                    .replace('{ml}', config.mlServiceBaseUrl + "/")
                    .replace('{storage}', config.storageServiceBaseUrl + "/")),
              deps: [ HttpClient, GENERIC_API_CONFIG ]
          },
      ]);
  }
