import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentityApiService } from './identity.api.service';
import { MetaApiService } from './meta.api.service';
import { ApiServiceFactory } from './api.service.factory';
import { DefaultApiServiceFactory } from './implementation/default.api.service.factory';

export * from './attachment';
export * from './document';
export * from './documentation';
export * from './entity';
export * from './genericentity';
export * from './lookup';
export * from './page';
export * from './pickvalue';
export * from './processingstate';
export * from './statistic';
export * from './tenant';
export * from './user';
export * from './role';
export * from './identity.api.service';
export * from './meta.api.service';
export * from './api.service.factory';

export interface MetaApiModuleConfig {
  identityServiceBaseUrl: string,
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string
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
          useFactory: () => new DefaultApiServiceFactory(config.identityServiceBaseUrl, config.metaServiceBaseUrl, config.documentServiceBaseUrl)
        }    
      ]
    };
  }
}
