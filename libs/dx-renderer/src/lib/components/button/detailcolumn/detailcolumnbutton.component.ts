import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import { EDIT_SERVICE, EditService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { Readonly } from "@ballware/renderer-commons";
import {
    DxButtonComponent, DxButtonModule, DxValidatorModule
} from 'devextreme-angular';
import { ValidationRule } from "devextreme/common";
import { ClickEvent as ButtonClickEvent } from "devextreme/ui/button";
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep } from "lodash";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { DetailCollectionEditing } from "../../../directives";

@Component({
    selector: 'ballware-detail-column-button',
    templateUrl: './detailcolumnbutton.component.html',
    styleUrls: ['./detailcolumnbutton.component.scss'],
    imports: [CommonModule, DxButtonModule, DxValidatorModule]
})
export class DetailColumnButtonComponent implements OnInit {
    @ViewChild('button', { static: false }) button?: DxButtonComponent;

    @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
    @Input() item!: Record<string, unknown>;
    @Input() dataMember!: string;

    identifier!: string;
    column!: GridLayoutColumn;
    detailItem!: Record<string, unknown>;
    detailItemIndex!: number;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    text: string|undefined;

    public validationRules$: Observable<Array<ValidationRule>> = new BehaviorSubject([])

    onClicked: ((e: ButtonClickEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        private readonly destroy: DestroyRef,
        public readonly: Readonly,
        private readonly editing: DetailCollectionEditing) {
    }

    ngOnInit(): void {

        this.validationRules$.pipe(
          takeUntilDestroyed(this.destroy),
        ).subscribe((rules) => {
           this.cell.column.validationRules = rules;
        });

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

                  this.text = this.preparedColumn?.caption;

                  this.onClicked = () => {

                    if (this.editing.detailEditorEvent) {
                        this.editing.detailEditorEvent(this.dataMember, this.detailItemIndex, this.detailItem, this.identifier, 'click');
                    }
                  };

                  this.prepared = true;
                }
            });
    }
}
