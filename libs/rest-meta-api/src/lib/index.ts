import { HttpClient } from "@angular/common/http";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { GENERIC_ENTITY_API_FACTORY, IDENTITY_ROLE_API, IDENTITY_USER_API, META_ATTACHMENT_API_FACTORY, META_DOCUMENT_API, META_DOCUMENTATION_API, META_ENTITY_API, META_LOOKUP_API, META_PAGE_API, META_PICKVALUE_API, META_PROCESSINGSTATE_API, META_STATISTIC_API, META_TENANT_API } from "@ballware/meta-api";
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
import { createMetaBackendTenantApi } from "./tenant";
import { createGenericBackendEntityApi } from "./genericentity";
import { createMetaBackendAttachmentApi } from "./attachment";

export function provideIdentityKeycloakRestApi(serviceBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders(    
    [  
        {
            provide: IDENTITY_USER_API,
            useFactory: (client: HttpClient) => createKeycloakUserApi(client, serviceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: IDENTITY_ROLE_API,
            useFactory: (client: HttpClient) => createKeycloakRoleApi(client, serviceBaseUrl),
            deps: [ HttpClient ]
        },      
    ]);
}

export function provideMetaBackendRestApi(metaServiceBaseUrl: string, documentServiceBaseUrl: string, storageServiceBaseUrl: string): EnvironmentProviders {
    return makeEnvironmentProviders(    
    [  
        {
            provide: META_ATTACHMENT_API_FACTORY,
            useFactory: (client: HttpClient) => (owner: string) => createMetaBackendAttachmentApi(client, storageServiceBaseUrl, owner),
            deps: [ HttpClient ]
        },
        {
            provide: META_DOCUMENT_API,
            useFactory: (client: HttpClient) => createMetaBackendDocumentApi(client, metaServiceBaseUrl, documentServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_DOCUMENTATION_API,
            useFactory: (client: HttpClient) => createMetaBackendDocumentationApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_ENTITY_API,
            useFactory: (client: HttpClient) => createMetaBackendEntityApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_LOOKUP_API,
            useFactory: (client: HttpClient) => createMetaBackendLookupApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_PAGE_API,
            useFactory: (client: HttpClient) => createMetaBackendPageApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_PICKVALUE_API,
            useFactory: (client: HttpClient) => createMetaBackendPickvalueApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_PROCESSINGSTATE_API,
            useFactory: (client: HttpClient) => createMetaBackendProcessingstateApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_STATISTIC_API,
            useFactory: (client: HttpClient) => createMetaBackendStatisticApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
        {
            provide: META_TENANT_API,
            useFactory: (client: HttpClient) => createMetaBackendTenantApi(client, metaServiceBaseUrl),
            deps: [ HttpClient ]
        },
    ]);
}
  
export function provideGenericBackendRestApi(metaServiceBaseUrl: string): EnvironmentProviders {
    return makeEnvironmentProviders(    
      [  
          {
              provide: GENERIC_ENTITY_API_FACTORY,
              useFactory: (client: HttpClient) => (entityBaseUrl: string) => createGenericBackendEntityApi(client, entityBaseUrl.replace('{meta}', metaServiceBaseUrl + "/")),
              deps: [ HttpClient ]
          },
      ]);
  }
  