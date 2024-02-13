import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { ApplicationModule } from './application/application.module';
import { EditModule } from './edit/edit.module';
import { I18N_PROVIDERS } from './i18n/i18n';
import { PageModule } from './page/page.module';

import globalConfig from 'devextreme/core/config';

export * from './application/application.module';

export interface RenderFactoryModuleConfig {
  licenseKey: string
}

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    I18NextModule.forRoot(),
    ApplicationModule,
    EditModule,
    PageModule
  ],
  providers: [
    I18N_PROVIDERS
  ],
  exports: [
    ApplicationModule
  ]
})
export class RenderFactoryModule {
  static forRoot(config: RenderFactoryModuleConfig): ModuleWithProviders<RenderFactoryModule> {

    globalConfig({ licenseKey: config.licenseKey });

    return {
      ngModule: RenderFactoryModule,
      providers: []
    };
  }
}
