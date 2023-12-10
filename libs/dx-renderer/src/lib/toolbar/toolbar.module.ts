import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { ToolbarLookupComponent } from './lookup/lookup.component';
import { ToolbarMultilookupComponent } from './multilookup/multilookup.component';
import { ToolbarDatetimeComponent } from './datetime/datetime.component';
import { ToolbarStaticlookupComponent } from './staticlookup/staticlookup.component';
import { ToolbarDropdownbuttonComponent } from './dropdownbutton/dropdownbutton.component';
import { ToolbarButtonComponent } from './button/button.component';
import { DxButtonModule, DxDateBoxModule, DxDropDownButtonModule, DxSelectBoxModule, DxTagBoxModule, DxToolbarModule } from 'devextreme-angular';

@NgModule({
  declarations: [
    ToolbarComponent,
    ToolbarLookupComponent,
    ToolbarMultilookupComponent,
    ToolbarDatetimeComponent,
    ToolbarStaticlookupComponent,
    ToolbarDropdownbuttonComponent,
    ToolbarButtonComponent,
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
