import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { DxActionSheetModule, DxButtonModule, DxContextMenuModule, DxDrawerModule, DxListModule, DxToastModule, DxToolbarModule, DxTreeViewModule } from 'devextreme-angular';

import { loadMessages, locale } from 'devextreme/localization';
import deMessages from 'devextreme/localization/messages/de.json';

import moment from 'moment';

import { PageModule } from '../page/page.module';
import { ApplicationAccountMenuComponent } from './account/menu.component';
import { BallwareApplicationRoutingModule } from './application.routing.module';
import { ApplicationComponent } from './application/application.component';
import { ApplicationHeaderComponent } from './header/header.component';
import { ApplicationNavigationDrawerComponent } from './navigation/drawer.component';
import { ApplicationNavigationMenuComponent } from './navigation/menu.component';
import { ApplicationNotificationComponent } from './notification/notification.component';

export { ApplicationComponent } from './application/application.component';

@NgModule({
  declarations: [
    ApplicationComponent,
    ApplicationHeaderComponent,
    ApplicationAccountMenuComponent,
    ApplicationNavigationDrawerComponent,
    ApplicationNavigationMenuComponent,
    ApplicationNotificationComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    BallwareApplicationRoutingModule,
    PageModule,
    DxToolbarModule,
    DxButtonModule,
    DxContextMenuModule,
    DxListModule,
    DxDrawerModule,
    DxTreeViewModule,
    DxActionSheetModule,
    DxToastModule
  ],
  exports: [
    ApplicationComponent
  ]
})
export class ApplicationModule {
  constructor() {
    loadMessages(deMessages);
    locale(navigator.language);    

    moment.locale(
      navigator.languages ? navigator.languages[0] : navigator.language
    );
  }
}
