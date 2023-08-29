import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';
import { ApplicationComponent } from './application/application.component';
import { ApplicationHeaderComponent } from './header/header.component';
import { DxActionSheetModule, DxButtonModule, DxContextMenuModule, DxDrawerModule, DxListModule, DxToastModule, DxToolbarModule, DxTreeViewModule } from 'devextreme-angular';
import { ApplicationAccountMenuComponent } from './account/menu.component';
import { ApplicationNavigationDrawerComponent } from './navigation/drawer.component';
import { ApplicationNavigationMenuComponent } from './navigation/menu.component';
import { PageModule } from '../page/page.module';
import { BallwareApplicationRoutingModule } from './application.routing.module';
import { ApplicationNotificationComponent } from './notification/notification.component';

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
export class ApplicationModule {}
