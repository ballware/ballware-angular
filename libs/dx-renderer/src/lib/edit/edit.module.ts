import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { DxActionSheetModule, DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFileUploaderModule, DxHtmlEditorModule, DxMapModule, DxNumberBoxModule, DxPopupModule, DxScrollViewModule, DxSelectBoxModule, DxTabPanelModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidationGroupModule, DxValidationSummaryModule, DxValidatorModule } from 'devextreme-angular';
import dxDateBox from 'devextreme/ui/date_box';
import dxHtmlEditor from 'devextreme/ui/html_editor';
import dxNumberBox from 'devextreme/ui/number_box';
import dxSelectBox from 'devextreme/ui/select_box';
import dxTagBox from 'devextreme/ui/tag_box';
import dxTextArea from 'devextreme/ui/text_area';
import dxTextBox from 'devextreme/ui/text_box';
import { DatacontainerModule } from '../datacontainer/datacontainer.module';
import { StatisticModule } from '../statistic/statistic.module';
import { CrudActionsComponent } from './actions/actions.component';
import { EditLayoutAttachmentsComponent } from './attachments/attachments.component';
import { EditLayoutBoolComponent } from './bool/bool.component';
import { EditLayoutButtonComponent } from './button/button.component';
import { CodeMirrorComponent } from './components/codeeditor/codemirror.component';
import { EditLayoutDatetimeComponent } from './datetime/datetime.component';
import { EditDetailComponent } from './detail/detail.component';
import { EditLayoutDetailGridComponent } from './detailgrid/detailgrid.component';
import { CrudDialogComponent } from './dialog/dialog.component';
import { EditLayoutEntitygridComponent } from './entitygrid/entitygrid.component';
import { EditLayoutFieldsetComponent } from './fieldset/fieldset.component';
import { ForeignEditPopupComponent } from './foreigneditpopup/foreigneditpopup.component';
import { EditLayoutGroupComponent } from './group/group.component';
import { EditLayoutJavascriptComponent } from './javascript/javascript.component';
import { EditLayoutJsonComponent } from './json/json.component';
import { EditLayoutContainerComponent } from './layout/container.component';
import { EditLayoutItemComponent } from './layout/item.component';
import { EditLayoutComponent } from './layout/layout.component';
import { EditLayoutLookupComponent } from './lookup/lookup.component';
import { EditLayoutMapComponent } from './map/map.component';
import { EditLayoutMultilookupComponent } from './multilookup/multilookup.component';
import { EditLayoutNumberComponent } from './number/number.component';
import { EditLayoutRichtextComponent } from './richtext/richtext.component';
import { EditLayoutSqlComponent } from './sql/sql.component';
import { EditLayoutStaticlookupComponent } from './staticlookup/staticlookup.component';
import { EditLayoutStaticmultilookupComponent } from './staticmultilookup/staticmultilookup.component';
import { EditLayoutStatisticComponent } from './statistic/statistic.component';
import { EditLayoutTabsComponent } from './tabs/tabs.component';
import { EditLayoutTextComponent } from './text/text.component';
import { EditLayoutTextareaComponent } from './textarea/textarea.component';

@NgModule({
  declarations: [
    CodeMirrorComponent,
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
    EditLayoutDetailGridComponent,
    EditLayoutJsonComponent,
    EditLayoutJavascriptComponent,
    EditLayoutSqlComponent,
    EditLayoutButtonComponent,
    EditLayoutAttachmentsComponent,
    EditLayoutRichtextComponent,
    EditLayoutStatisticComponent,
    EditDetailComponent,
    ForeignEditPopupComponent,
    CrudActionsComponent,
    CrudDialogComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    DatacontainerModule,
    StatisticModule,
    DxButtonModule,
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
    DxPopupModule,
    DxFileUploaderModule,
    DxHtmlEditorModule
  ],
  exports: [
    EditLayoutContainerComponent,
    EditLayoutComponent,
    EditDetailComponent,
    CrudActionsComponent
  ]

})
export class EditModule {
  constructor() {
    dxTextBox.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxSelectBox.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxTagBox.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxTextArea.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxDateBox.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxNumberBox.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });

    dxHtmlEditor.defaultOptions({
      options: {
        stylingMode: 'underlined'
      }
    });
  }
}
