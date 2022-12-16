import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentityApiService } from './identityapiservice';
import { DefaultIdentityApiService } from './implementation/defaultidentityapiservice';
import { MetaApiService } from './metaapiservice';
import { DefaultMetaApiService } from './implementation/defaultmetaapiservice';

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
export * from './identityapiservice';
export * from './metaapiservice';
export * from './implementation/defaultidentityapiservice';
export * from './implementation/defaultmetaapiservice';

export interface MetaApiModuleConfig {
  identityServiceBaseUrl: string,
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string
}

@NgModule({
  imports: [CommonModule],
})
export class MetaApiModule {
  static forRoot(config: MetaApiModuleConfig): ModuleWithProviders<MetaApiModule> {
    return {
      ngModule: MetaApiModule,
      providers: [
        {
          provide: IdentityApiService,
          useFactory: () => new DefaultIdentityApiService(config.identityServiceBaseUrl)
        },
        {
          provide: MetaApiService,
          useFactory: () => new DefaultMetaApiService(config.metaServiceBaseUrl, config.documentServiceBaseUrl)
        }
      ]
    };
  }
}
