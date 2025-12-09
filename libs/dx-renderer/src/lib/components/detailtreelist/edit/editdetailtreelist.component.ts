import { Component, ViewChild } from "@angular/core";
import { DxDataGridComponent, DxToolbarModule, DxTreeListModule, DxValidatorModule } from "devextreme-angular";
import { Column } from "devextreme/ui/tree_list";
import { CommonModule } from "@angular/common";
import { EditLayoutCodeComponent } from "../../code";
import { EditItemLivecycle, UnknownArrayValue, Readonly, Visible } from "@ballware/renderer-commons";
import { DetailCollectionEditing } from "../../../directives";
import { ValidationCallbackData } from "devextreme/common";
import { I18NextPipe } from "angular-i18next";
import { DetailDynamicColumnComponent } from "../../../datacontainer";

@Component({
    selector: 'ballware-edit-detailtreelist',
    templateUrl: './editdetailtreelist.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextPipe, DxToolbarModule, DxTreeListModule, DxValidatorModule, DetailDynamicColumnComponent, EditLayoutCodeComponent],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible, DetailCollectionEditing]
})
export class EditLayoutDetailTreeListComponent {

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
