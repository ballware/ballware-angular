import { Component, Inject, Input } from "@angular/core";
import { GridLayoutColumn } from "@ballware/meta-model";
import { CRUD_SERVICE, CrudService, EditModes } from "@ballware/meta-services";
import { WithDestroy } from "../../utils/withdestroy";
import { DxButtonModule } from "devextreme-angular";
import { I18NextModule } from "angular-i18next";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ballware-edit-detaileditpopup',
    templateUrl: './detaileditpopup.component.html',
    styleUrls: ['./detaileditpopup.component.scss'],
    imports: [CommonModule, I18NextModule, DxButtonModule],
    standalone: true
})
export class DetailEditPopupComponent extends WithDestroy() {

    @Input() column!: GridLayoutColumn;
    @Input() readOnly: boolean|null = null;
    @Input() item!: Record<string, unknown>;
    
    constructor(@Inject(CRUD_SERVICE) private crudService: CrudService) {
        super();
    }
    
    dialogShow(): void {
        this.crudService.detailColumnEdit({ mode: this.readOnly ? EditModes.VIEW : EditModes.EDIT, column: this.column, item: this.item });
    }
}