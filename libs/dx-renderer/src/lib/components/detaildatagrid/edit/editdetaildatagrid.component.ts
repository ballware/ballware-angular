import { Component, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxDataGridModule, DxToolbarModule, DxValidatorModule } from "devextreme-angular";
import { ValidationCallbackData } from "devextreme/common";
import { Column } from "devextreme/ui/data_grid";
import { CommonModule } from "@angular/common";
import { EditLayoutCodeComponent } from "../../code";
import { I18NextPipe } from "angular-i18next";
import { EditItemLivecycle, Readonly, UnknownArrayValue, Visible } from "@ballware/renderer-commons";
import { DetailCollectionEditing } from "../../../directives";

@Component({
    selector: 'ballware-edit-detaildatagrid',
    templateUrl: './editdetaildatagrid.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextPipe, DxDataGridModule, DxValidatorModule, DxToolbarModule, EditLayoutCodeComponent],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible, DetailCollectionEditing]
})
export class EditLayoutDetailDataGridComponent {

    @ViewChild('grid', { static: false }) grid?: DxDataGridComponent;

    public get columns() {
      return this.editing.columns as Column[];
    }

    constructor(
        public livecycle: EditItemLivecycle,
        public readonly: Readonly,
        public value: UnknownArrayValue,
        public visible: Visible,
        public editing: DetailCollectionEditing
      ) {

    }

    public onGridValidateNotEditing(options: ValidationCallbackData) {

      if (this.grid?.instance.hasEditData()) {
        if ((this.grid?.instance as any).getController('validating').validate()) {
          this.grid?.instance.saveEditData();
        }
      }

      return !this.grid?.instance.hasEditData();
    }


}
