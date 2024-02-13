import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { DxButtonModule, DxDateBoxModule, DxDropDownButtonModule, DxSelectBoxModule, DxTagBoxModule, DxToolbarModule } from 'devextreme-angular';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    DxToolbarModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxDateBoxModule
  ],
  exports: [
    ToolbarComponent
  ],
})
export class ToolbarModule {}
