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
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { Readonly } from "@ballware/renderer-commons";
import { I18NextPipe } from "angular-i18next";
import {
    DxCheckBoxComponent, DxCheckBoxModule, DxDateBoxComponent, DxDateBoxModule, DxNumberBoxComponent, DxNumberBoxModule,
    DxSelectBoxComponent,
    DxSelectBoxModule, DxTagBoxComponent, DxTagBoxModule, DxTextBoxComponent, DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { RequiredRule, ValidationRule } from "devextreme/common";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as LookupValueChangedEvent } from "devextreme/ui/select_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_box";
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep, get } from "lodash";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DetailCollectionEditing } from "../../../directives";
import { LOOKUP_DELEGATE_BUILDER_FACTORY, LookupDelegate, LookupDelegateBuilderFactory } from '../../../utils';
import { DetailEditPopupComponent } from "../../popup";
import { prepareLookupDelegateForGridLayoutColumn } from '../utils';

@Component({
    selector: 'ballware-detail-dynamic-column',
    templateUrl: './detaildynamiccolumn.component.html',
    styleUrls: ['./detaildynamiccolumn.component.scss'],
    imports: [CommonModule, I18NextPipe, DetailEditPopupComponent, DxTextBoxModule, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxSelectBoxModule, DxTagBoxModule, DxValidatorModule]
})
export class DetailDynamicColumnComponent implements OnInit {
    @ViewChild('textbox', { static: false }) textbox?: DxTextBoxComponent;
    @ViewChild('checkbox', { static: false }) checkbox?: DxCheckBoxComponent;
    @ViewChild('numberbox', { static: false }) numberbox?: DxNumberBoxComponent;
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;
    @ViewChild('datetimebox', { static: false }) datetimebox?: DxDateBoxComponent;
    @ViewChild('statictagbox', { static: false }) statictagbox?: DxTagBoxComponent;
    @ViewChild('tagbox', { static: false }) tagbox?: DxTagBoxComponent;
    @ViewChild('selectbox', { static: false }) selectbox?: DxSelectBoxComponent;

    @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
    @Input() item!: Record<string, unknown>;
    @Input() dataMember!: string;

    identifier!: string;
    column!: GridLayoutColumn;
    detailItem!: Record<string, unknown>;
    detailItemIndex!: number;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown = undefined;
    lookup: LookupDelegate|undefined;

    public requiredValidation$ = new BehaviorSubject<boolean>(false);

    public validationRules$: Observable<Array<ValidationRule>>|undefined;

    onValueChanged: ((e: TextValueChangedEvent|BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|LookupValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY) private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory,
        private readonly destroy: DestroyRef,
        public readonly: Readonly,
        private readonly editing: DetailCollectionEditing) {
    }

    stringValue() {
        return this.value as string;
    }

    boolValue() {
        return this.value as boolean;
    }

    numberValue() {
        return this.value as number;
    }

    dateValue() {
        return this.value as Date;
    }

    lookupValue() {
        return this.value as any;
    }

    multiLookupValue() {
        return this.value as Array<any>;
    }

    ngOnInit(): void {

      this.destroy.onDestroy(() => {
        console.log('DetailcolumnpopupComponent destroyed');
      });

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
            this.value = get(this.detailItem, this.identifier);
        }

        combineLatest([
            this.lookupService.lookups$,
            this.lookupService.getGenericLookupByIdentifier$,
            this.editService.detailGridCellPreparing$])
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe(([lookups, getGenericLookupByIdentifier, detailGridCellPreparing]) => {
                if (lookups && getGenericLookupByIdentifier && detailGridCellPreparing) {
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

                  this.lookup = prepareLookupDelegateForGridLayoutColumn(
                    this.preparedColumn,
                    this.createLookupDelegateBuilder,
                    getGenericLookupByIdentifier,
                    this.item,
                    lookups,
                    this.detailItem
                  );

                  this.prepared = true;
                }
            });
    }
}
