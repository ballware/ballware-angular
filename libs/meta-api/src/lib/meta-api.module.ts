import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ApiServiceFactory } from './api.service.factory';
import { IdentityApiService } from './identity.api.service';
import { DefaultApiServiceFactory } from './implementation/default.api.service.factory';
import { MetaApiService } from './meta.api.service';

export * from './api.service.factory';
export * from './attachment';
export * from './document';
export * from './documentation';
export * from './entity';
export * from './error';
export * from './genericentity';
export * from './identity.api.service';
export * from './lookup';
export * from './meta.api.service';
export * from './page';
export * from './pickvalue';
export * from './processingstate';
export * from './role';
export * from './statistic';
export * from './tenant';
export * from './user';

export interface MetaApiModuleConfig {
  identityServiceBaseUrl: string,
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string,
  storageServiceBaseUrl: string
}

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: IdentityApiService,
      useFactory: (apiServiceFactory: ApiServiceFactory) => apiServiceFactory.createIdentityApi(),
      deps: [ApiServiceFactory]
    },
    {
      provide: MetaApiService,
      useFactory: (apiServiceFactory: ApiServiceFactory) => apiServiceFactory.createMetaApi(),
      deps: [ApiServiceFactory]
    }
  ]
})
export class MetaApiModule {
  static forRoot(config: MetaApiModuleConfig): ModuleWithProviders<MetaApiModule> {
    return {
      ngModule: MetaApiModule,
      providers: [
        {
          provide: ApiServiceFactory,
          useFactory: (httpClient: HttpClient) => new DefaultApiServiceFactory(httpClient, config.identityServiceBaseUrl, config.metaServiceBaseUrl, config.documentServiceBaseUrl, config.storageServiceBaseUrl),
          deps: [
            HttpClient
          ]
        }    
      ]
    };
  }
}
