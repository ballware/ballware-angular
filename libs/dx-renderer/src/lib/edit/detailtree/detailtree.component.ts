import { Component, ViewChild } from "@angular/core";
import { DxDataGridComponent, DxToolbarModule, DxTreeListModule, DxValidatorModule } from "devextreme-angular";
import { Column } from "devextreme/ui/tree_list";
import { CommonModule } from "@angular/common";
import { DynamicColumnComponent } from "../../datacontainer";
import { EditLayoutJsonComponent } from "../json/json.component";
import { Destroy, EditItemLivecycle, UnknownArrayValue, Readonly, Visible } from "@ballware/renderer-commons";
import { DetailCollectionEditing } from "../../directives";
import { ValidationCallbackData } from "devextreme/common";
import { I18NextModule } from "angular-i18next";

@Component({
    selector: 'ballware-edit-detailtree',
    templateUrl: './detailtree.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DxToolbarModule, DxTreeListModule, DxValidatorModule, DynamicColumnComponent, EditLayoutJsonComponent],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible, DetailCollectionEditing],
    standalone: true
})
export class EditLayoutDetailTreeComponent {

    @ViewChild('grid', { static: false }) grid?: DxDataGridComponent;

    public get columns() {
      return this.editing.columns as Column[];
    }

    constructor(        
        public destroy: Destroy,
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