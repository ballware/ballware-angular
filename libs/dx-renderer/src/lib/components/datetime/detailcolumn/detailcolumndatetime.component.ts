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
    DxDateBoxComponent, DxDateBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { RequiredRule, ValidationRule } from "devextreme/common";
import { DateType, ValueChangedEvent as DateValueChangedEvent } from 'devextreme/ui/date_box';
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep, get } from "lodash";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DetailCollectionEditing } from "../../../directives";

@Component({
    selector: 'ballware-detail-column-datetime',
    templateUrl: './detailcolumndatetime.component.html',
    styleUrls: ['./detailcolumndatetime.component.scss'],
    imports: [CommonModule, DxDateBoxModule, DxValidatorModule]
})
export class DetailColumnDatetimeComponent implements OnInit {
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;

    @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
    @Input() item!: Record<string, unknown>;
    @Input() dataMember!: string;

    public type!: DateType;
    public displayFormat!: string;

    identifier!: string;
    column!: GridLayoutColumn;
    detailItem!: Record<string, unknown>;
    detailItemIndex!: number;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: Date|undefined = undefined;

    public requiredValidation$ = new BehaviorSubject<boolean>(false);

    public validationRules$: Observable<Array<ValidationRule>>|undefined;

    onValueChanged: ((e: DateValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        private readonly destroy: DestroyRef,
        public readonly readonly: Readonly,
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
            this.value = get(this.detailItem, this.identifier) as Date|undefined;
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

                  this.type = this.preparedColumn?.type as DateType;

                  switch (this.preparedColumn?.type) {
                    case 'datetime':
                      this.displayFormat = this.translator('format.datetime');
                      break;
                    case 'date':
                    default:
                      this.displayFormat = this.translator('format.date');
                  }

                  this.prepared = true;
                }
            });
    }
}
