import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { ApplicationModule } from './application/application.module';
import { EditModule } from './edit/edit.module';
import { I18N_PROVIDERS } from './i18n/i18n';
import { PageModule } from './page/page.module';

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
export class RenderFactoryModule {}
