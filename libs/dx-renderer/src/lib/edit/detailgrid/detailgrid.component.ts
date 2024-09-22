import { Component, ViewChild } from "@angular/core";
import { DxDataGridComponent, DxDataGridModule, DxToolbarModule, DxValidatorModule } from "devextreme-angular";
import { ValidationCallbackData } from "devextreme/common";
import { Column } from "devextreme/ui/data_grid";
import { CommonModule } from "@angular/common";
import { DynamicColumnComponent } from "../../datacontainer";
import { EditLayoutJsonComponent } from "../json/json.component";
import { I18NextModule } from "angular-i18next";
import { Destroy, EditItemLivecycle, Readonly, UnknownArrayValue, Visible } from "@ballware/renderer-commons";
import { DetailCollectionEditing } from "../../directives";

@Component({
    selector: 'ballware-edit-detailgrid',
    templateUrl: './detailgrid.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DxDataGridModule, DxValidatorModule, DxToolbarModule, DynamicColumnComponent, EditLayoutJsonComponent],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible, DetailCollectionEditing],
    standalone: true
})
export class EditLayoutDetailGridComponent {

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