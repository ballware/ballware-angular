import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

import { EditLayoutComponent } from './layout/layout.component';
import { EditLayoutItemComponent } from './layout/item.component';
import { EditLayoutContainerComponent } from './layout/container.component';
import { EditLayoutGroupComponent } from './group/group.component';
import { EditLayoutFieldsetComponent } from './fieldset/fieldset.component';
import { EditLayoutBoolComponent } from './bool/bool.component';
import { EditLayoutDatetimeComponent } from './datetime/datetime.component';
import { EditLayoutLookupComponent } from './lookup/lookup.component';
import { EditLayoutMapComponent } from './map/map.component';
import { EditLayoutMultilookupComponent } from './multilookup/multilookup.component';
import { EditLayoutNumberComponent } from './number/number.component';
import { EditLayoutStaticlookupComponent } from './staticlookup/staticlookup.component';
import { EditLayoutStaticmultilookupComponent } from './staticmultilookup/staticmultilookup.component';
import { EditLayoutTabsComponent } from './tabs/tabs.component';
import { EditLayoutTextComponent } from './text/text.component';
import { EditLayoutTextareaComponent } from './textarea/textarea.component';
import { EditLayoutEntitygridComponent } from './entitygrid/entitygrid.component';
import { EditDetailComponent } from './detail/detail.component';
import { DxActionSheetModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxMapModule, DxNumberBoxModule, DxPopupModule, DxScrollViewModule, DxSelectBoxModule, DxTabPanelModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidationGroupModule, DxValidationSummaryModule, DxValidatorModule } from 'devextreme-angular';
import { DatagridComponent } from './components/datagrid/datagrid.component';
import { EntitygridComponent } from './components/entitygrid/entitygrid.component';
import { DatagridMasterdetailComponent } from './components/datagrid/masterdetail.component';
import { CrudActionsComponent } from './actions/actions.component';
import { CrudDialogComponent } from './dialog/dialog.component';

@NgModule({
  declarations: [
    DatagridComponent,
    DatagridMasterdetailComponent,
    EntitygridComponent,
    EditLayoutComponent,
    EditLayoutContainerComponent,
    EditLayoutFieldsetComponent,
    EditLayoutItemComponent,
    EditLayoutGroupComponent,
    EditLayoutBoolComponent,
    EditLayoutDatetimeComponent,
    EditLayoutLookupComponent,
    EditLayoutMapComponent,
    EditLayoutMultilookupComponent,
    EditLayoutNumberComponent,
    EditLayoutStaticlookupComponent,
    EditLayoutStaticmultilookupComponent,
    EditLayoutTabsComponent,
    EditLayoutTextComponent,
    EditLayoutTextareaComponent,
    EditLayoutEntitygridComponent,
    EditDetailComponent,
    CrudActionsComponent,
    CrudDialogComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    DxActionSheetModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxTabPanelModule,
    DxMapModule,
    DxDataGridModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxValidationSummaryModule,
    DxScrollViewModule,
    DxPopupModule
  ],
  exports: [
    EditLayoutContainerComponent,
    EditLayoutComponent,
    EditDetailComponent,
    EntitygridComponent,
    CrudActionsComponent
  ]

})
export class EditModule {}
