import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { IDENTITY_ROLE_API, IDENTITY_USER_API, IdentityRoleApi, IdentityUserApi, META_DOCUMENTATION_API, META_TENANT_API, MetaDocumentationApi, MetaTenantApi } from "@ballware/meta-api";
import { CompiledTenant } from "@ballware/meta-model";
import { of } from "rxjs";

const builderUserApi = {

} as IdentityUserApi;

const builderRoleApi = {

} as IdentityRoleApi;

const builderTenantApi = {
    metadataForTenant: (tenant) => of({
        id: tenant,
        name: 'Builder',
        navigation: {
            title: 'Builder',
            defaultUrl: '/page/project',
            items: [
                {                    
                    type: 'page',
                    options: {
                        page: 'project',
                        caption: 'Projekt',                        
                    },
                    items: []
                }
            ]
        },
        hasRight: (user, right) => true
    } as CompiledTenant)

} as MetaTenantApi;

const builderDocumentationApi = {

} as MetaDocumentationApi;


export function provideIdentityBuilderFakeApi(): EnvironmentProviders {
  return makeEnvironmentProviders(    
    [  
        {
            provide: IDENTITY_USER_API,
            useValue: builderUserApi,
            deps: []
        },
        {
            provide: IDENTITY_ROLE_API,
            useValue: builderRoleApi,
            deps: []
        },      
    ]);
}

export function provideBuilderMetaApi(): EnvironmentProviders {
    return makeEnvironmentProviders(    
      [  
          {
              provide: META_TENANT_API,
              useValue: builderTenantApi,
              deps: []
          },
          {
            provide: META_DOCUMENTATION_API,
            useValue: builderDocumentationApi,
            deps: []
          }
      ]);
}