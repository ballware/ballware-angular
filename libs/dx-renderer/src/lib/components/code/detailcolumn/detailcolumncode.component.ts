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
    DxTextAreaComponent, DxTextAreaModule, DxValidatorModule
} from 'devextreme-angular';
import { RequiredRule, ValidationRule } from "devextreme/common";
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_area";
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep, get } from "lodash";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DetailCollectionEditing } from "../../../directives";

@Component({
    selector: 'ballware-detail-column-textarea',
    templateUrl: './detailcolumncode.component.html',
    styleUrls: ['./detailcolumncode.component.scss'],
    imports: [CommonModule, DxTextAreaModule, DxValidatorModule]
})
export class DetailColumnCodeComponent implements OnInit {
    @ViewChild('textbox', { static: false }) textbox?: DxTextAreaComponent;

    @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
    @Input() item!: Record<string, unknown>;
    @Input() dataMember!: string;

    identifier!: string;
    column!: GridLayoutColumn;
    detailItem!: Record<string, unknown>;
    detailItemIndex!: number;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: string|undefined = undefined;

    public requiredValidation$ = new BehaviorSubject<boolean>(false);

    public validationRules$: Observable<Array<ValidationRule>>|undefined;

    onValueChanged: ((e: TextValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        private readonly destroy: DestroyRef,
        public readonly: Readonly,
        private readonly editing: DetailCollectionEditing) {
    }

    ngOnInit(): void {

        this.validationRules$ = combineLatest([this.requiredValidation$]).pipe(
            takeUntilDestroyed(this.destroy),
            map(([required]) => {
                const validationRules = [] as ValidationRule[];

                if (required) {
                    validationRules.push({
                        type: 'required',
                        message: this.translator('validation.messages.required', { label: this.preparedColumn?.caption })
                    } as RequiredRule);
                }

                return validationRules;
            })
        );

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

        if (this.detailItem && this.identifier) {
            this.value = get(this.detailItem, this.identifier) as string;
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

                  this.onValueChanged = (e) => {
                    this.cell.setValue(e.value);

                    if (this.editing.detailEditorValueChanged) {
                        this.editing.detailEditorValueChanged(this.dataMember, this.detailItemIndex, this.detailItem, this.identifier, e.value, true);
                    }
                  };

                  this.requiredValidation$.next(this.preparedColumn.required ?? false);
                  this.prepared = true;
                }
            });
    }
}
