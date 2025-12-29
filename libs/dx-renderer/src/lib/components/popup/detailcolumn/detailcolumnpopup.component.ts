import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import { EDIT_SERVICE, EditService } from "@ballware/meta-services";
import { Readonly } from "@ballware/renderer-commons";
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep } from "lodash";
import { combineLatest } from "rxjs";
import { DetailEditPopupComponent } from "../../popup";

@Component({
    selector: 'ballware-detail-column-popup',
    templateUrl: './detailcolumnpopup.component.html',
    styleUrls: ['./detailcolumnpopup.component.scss'],
    imports: [CommonModule, DetailEditPopupComponent]
})
export class DetailColumnPopupComponent implements OnInit {

    @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
    @Input() item!: Record<string, unknown>;
    @Input() dataMember!: string;

    identifier!: string;
    column!: GridLayoutColumn;
    detailItem!: Record<string, unknown>;
    detailItemIndex!: number;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;

    constructor(
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        private readonly destroy: DestroyRef,
        public readonly: Readonly) {
    }

    ngOnInit(): void {

        if (this.cell) {
            this.identifier = this.cell.column.editorOptions.dataMember;
            this.detailItem = this.cell.data;
            this.detailItemIndex = this.cell.rowIndex;
            this.column = this.cell.column.editorOptions;
        }

        combineLatest([
            this.editService.detailGridCellPreparing$])
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe(([detailGridCellPreparing]) => {
                if (detailGridCellPreparing) {
                  this.preparedColumn = detailGridCellPreparing({
                    dataMember: this.dataMember,
                    detailItem: this.detailItem,
                    identifier: this.identifier,
                    options: cloneDeep(this.column)
                  });

                  this.prepared = true;
                }
            });
    }
}
