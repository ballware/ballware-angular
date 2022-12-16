import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditModule } from './edit/edit.module';
import { PageModule } from './page/page.module';
import { I18NextModule } from 'angular-i18next';
import { I18N_PROVIDERS } from './i18n/i18n';
import { ApplicationModule } from './application/application.module';

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
export class RenderFactoryModule { }
