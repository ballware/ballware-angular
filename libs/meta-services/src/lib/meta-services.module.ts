import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from './settings.service';
import { DefaultSettingsService } from './implementation/default.settings.service';
import { TenantService } from './tenant.service';
import { DefaultTenantService } from './implementation/default.tenant.service';

export * from './auth.service';
export * from './attachment.service';
export * from './crud.service';
export * from './edit.service';
export * from './lookup.service';
export * from './meta.service';
export * from './responsive.service';
export * from './settings.service';
export * from './tenant.service';
export * from './page.service';
export * from './editmodes';
export * from './edititemref';
export * from './toolbaritemref';

export * from './implementation/default.settings.service';
export * from './implementation/default.tenant.service';
export * from './implementation/default.lookup.service';
export * from './implementation/default.page.service';
export * from './implementation/default.meta.service';
export * from './implementation/default.crud.service';

export interface MetaServicesModuleConfig {
  version: string,
  googlekey: string,
  identityIssuer: string,
  identityClient: string,
  identityScopes: string,
  identityTenantClaim: string,
  identityUsernameClaim: string,
  identityProfileUrl: string
}

@NgModule({
  imports: [CommonModule],
})
export class MetaServicesModule {
  static forRoot(config: MetaServicesModuleConfig): ModuleWithProviders<MetaServicesModule> {
    return {
      ngModule: MetaServicesModule,
      providers: [
        {
          provide: SettingsService,
          useFactory: () => new DefaultSettingsService(config.version, config.googlekey, config.identityIssuer, config.identityClient, config.identityScopes, config.identityTenantClaim, config.identityUsernameClaim, config.identityProfileUrl)
        },
        {
          provide: TenantService, useClass: DefaultTenantService
        }
      ]
    };
  }
}
