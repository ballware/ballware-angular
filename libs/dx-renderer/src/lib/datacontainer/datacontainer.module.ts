import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxMapModule, DxNumberBoxModule, DxSelectBoxModule, DxTagBoxModule } from 'devextreme-angular';
import { DynamicColumnComponent } from './columns/dynamiccolumn.component';
import { DatagridComponent } from './datagrid/datagrid.component';
import { DetailEditPopupComponent } from './detaileditpopup/detaileditpopup.component';
import { EntitygridComponent } from './entitygrid/entitygrid.component';

@NgModule({
  declarations: [
    DatagridComponent,
    EntitygridComponent,
    DynamicColumnComponent,
    DetailEditPopupComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxDataGridModule,
    DxMapModule,
  ],
  exports: [
    DatagridComponent,
    EntitygridComponent,
    DynamicColumnComponent
  ]
})
export class DatacontainerModule {}
