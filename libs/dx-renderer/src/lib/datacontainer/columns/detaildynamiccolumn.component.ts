import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { GridLayoutColumn } from "@ballware/meta-model";
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, PickvalueCreator, Translator, TRANSLATOR } from "@ballware/meta-services";
import { Destroy, Readonly } from "@ballware/renderer-commons";
import { I18NextModule } from "angular-i18next";
import {
    DxCheckBoxComponent, DxCheckBoxModule, DxDateBoxComponent, DxDateBoxModule, DxNumberBoxComponent, DxNumberBoxModule,
    DxSelectBoxComponent,
    DxSelectBoxModule, DxTagBoxComponent, DxTagBoxModule, DxTextBoxComponent, DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { RequiredRule, ValidationRule } from "devextreme/common";
import DataSource from "devextreme/data/data_source";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as LookupValueChangedEvent } from "devextreme/ui/select_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_box";
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { cloneDeep, get } from "lodash";
import { BehaviorSubject, combineLatest, map, Observable, takeUntil } from "rxjs";
import { DetailCollectionEditing } from "../../directives";
import { createLookupDataSource } from "../../utils";
import { WithDestroy } from "../../utils/withdestroy";
import { DetailEditPopupComponent } from "../detaileditpopup/detaileditpopup.component";

@Component({
    selector: 'ballware-detail-dynamic-column',
    templateUrl: './detaildynamiccolumn.component.html',
    styleUrls: ['./detaildynamiccolumn.component.scss'],
    imports: [CommonModule, I18NextModule, DetailEditPopupComponent, DxTextBoxModule, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxSelectBoxModule, DxTagBoxModule, DxValidatorModule],
    hostDirectives: [Destroy],
    standalone: true
})
export class DetailDynamicColumnComponent extends WithDestroy() implements OnInit, OnDestroy, AfterViewInit {
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
    value: unknown|undefined = undefined;
    lookupDatasource: DataSource|object[]|undefined;
    lookupValueExpr: string|undefined;
    lookupDisplayExpr: string|undefined;

    public requiredValidation$ = new BehaviorSubject<boolean>(false);    
    
    public validationRules$: Observable<Array<ValidationRule>>|undefined;

    onValueChanged: ((e: TextValueChangedEvent|BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|LookupValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private translator: Translator,
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        @Inject(EDIT_SERVICE) private editService: EditService,           
        private destroy: Destroy,
        public readonly: Readonly,
        private editing: DetailCollectionEditing) {
        super();
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

    getEditorOption(option: string): unknown {
        switch (this.preparedColumn?.type) {
            case 'string':
                return this.textbox?.instance.option(option);
            case 'bool':
                return this.checkbox?.instance.option(option);
            case 'number':
                return this.numberbox?.instance.option(option);
            case 'date':
                return this.datebox?.instance.option(option);
            case 'datetime':
                return this.datetimebox?.instance.option(option);
            case 'staticmultilookup':
                return this.statictagbox?.instance.option(option);
            case 'multilookup':
                return this.tagbox?.instance.option(option);
        }

        return undefined;
    }

    setEditorOption(option: string, value: unknown) {
        switch (this.preparedColumn?.type) {
            case 'string':
                return this.textbox?.instance.option(option, value);
            case 'bool':
                return this.checkbox?.instance.option(option, value);
            case 'number':
                return this.numberbox?.instance.option(option, value);
            case 'date':
                return this.datebox?.instance.option(option, value);
            case 'datetime':
                return this.datetimebox?.instance.option(option, value);
            case 'staticmultilookup':
                return this.statictagbox?.instance.option(option, value);
            case 'multilookup':
                return this.tagbox?.instance.option(option, value);
        }
    }

    ngOnInit(): void {

        this.validationRules$ = combineLatest([this.requiredValidation$])
            .pipe(takeUntil(this.destroy.destroy$))
            .pipe(map(([required]) => {
                const validationRules = [] as ValidationRule[];

                if (required) {
                    validationRules.push({
                        type: 'required',
                        message: this.translator('validation.messages.required', { label: this.preparedColumn?.caption })
                    } as RequiredRule);
                }

                return validationRules;
            }));

        this.validationRules$.pipe(
            takeUntil(this.destroy.destroy$)
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
            .pipe(takeUntil(this.destroy$))
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

                  this.prepared = true;

                  if (this.preparedColumn.type === 'staticmultilookup') {
                    this.lookupDatasource = this.preparedColumn.items ??
                      (this.preparedColumn.itemsMember ? get(this.item, this.preparedColumn.itemsMember)
                        : (this.preparedColumn.lookupMember ? get(this.item, this.preparedColumn.lookupMember) : undefined)) as Array<object>;

                    this.lookupValueExpr = this.preparedColumn.valueExpr ?? 'Value';
                    this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? 'Text';
                  } else if (this.preparedColumn.type === 'pickvalue' || this.preparedColumn.type === 'lookup' || this.preparedColumn.type === 'multilookup') {
                    let lookup: LookupDescriptor | undefined = undefined;

                    if (this.preparedColumn.lookup) {
                      const foundLookup = lookups[this.preparedColumn.lookup];

                      if (foundLookup as LookupCreator && this.preparedColumn.lookupParam) {
                        const dynamicLookupParam = (get(this.item, this.preparedColumn.lookupParam) ?? this.preparedColumn.lookupParam) as string;

                        lookup = (foundLookup as LookupCreator)(dynamicLookupParam);
                      } else if (foundLookup as PickvalueCreator && this.preparedColumn.pickvalueEntity && this.preparedColumn.pickvalueField) {
                        const dynamicPickvalueEntity = (get(this.item, this.preparedColumn.pickvalueEntity) ?? this.preparedColumn.pickvalueEntity) as string;
                        const dynamicPickvalueField = (get(this.item, this.preparedColumn.pickvalueField) ?? this.preparedColumn.pickvalueField) as string;

                        lookup = (foundLookup as PickvalueCreator)(dynamicPickvalueEntity, dynamicPickvalueField);
                      } else if (foundLookup as LookupDescriptor) {
                        lookup = foundLookup as LookupDescriptor;
                      }

                      if (!lookup) {
                        lookup = getGenericLookupByIdentifier(this.preparedColumn.lookup, this.preparedColumn.valueExpr ?? 'Id', this.preparedColumn.displayExpr ?? 'Name');
                      }

                      if (lookup) {
                        this.lookupDatasource = createLookupDataSource(
                          (lookup.store as LookupStoreDescriptor).listFunc,
                          (lookup.store as LookupStoreDescriptor).byIdFunc
                        );

                        this.lookupValueExpr = this.preparedColumn.valueExpr ?? lookup.valueMember ?? 'Id';
                        this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? lookup.displayMember ?? 'Name';
                      } else {
                        this.lookupDatasource = undefined;
                      }
                    }
                  }
                }
            });
    }

    ngAfterViewInit(): void {

        switch (this.preparedColumn?.type) {
            case 'string':
                if (this.textbox?.instance){

                    const editorOptions = this.textbox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.textbox.instance
                    });

                    if (editorOptions) {
                        this.textbox.instance.option(editorOptions);
                    }
                }
                break;
            case 'bool':
                if (this.checkbox?.instance){

                    const editorOptions = this.checkbox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.checkbox.instance
                    });

                    if (editorOptions) {
                        this.checkbox.instance.option(editorOptions);
                    }
                }
                break;
            case 'number':
                if (this.numberbox?.instance) {
                    const editorOptions = this.numberbox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.numberbox.instance
                    });

                    if (editorOptions) {
                        this.numberbox.instance.option(editorOptions);
                    }
                }
                break;
            case 'date':
                if (this.datebox?.instance) {
                    const editorOptions = this.datebox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.datebox.instance
                    });

                    if (editorOptions) {
                        this.datebox.instance.option(editorOptions);
                    }
                }
                break;
            case 'datetime':
                if (this.datetimebox?.instance) {
                    const editorOptions = this.datetimebox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.datetimebox.instance
                    });

                    if (editorOptions) {
                        this.datetimebox.instance.option(editorOptions);
                    }
                }
                break;
            case 'staticmultilookup':
                if (this.statictagbox?.instance) {
                    const editorOptions = this.statictagbox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.statictagbox.instance
                    });

                    if (editorOptions) {
                        this.statictagbox.instance.option(editorOptions);
                    }
                }
                break;
            case 'lookup':
            case 'pickvalue':
              if (this.selectbox?.instance) {
                const editorOptions = this.selectbox.instance.option();

                this.editing.onCustomEditorPreparing({
                  row: this.detailItem,
                  rowIndex: this.detailItemIndex,
                  dataField: this.identifier,
                  column: this.preparedColumn,
                  editorOptions: editorOptions,
                  component: this.selectbox.instance
                });

                if (editorOptions) {
                  this.selectbox.instance.option(editorOptions);
                }
              }
              break;
            case 'multilookup':
                if (this.tagbox?.instance) {
                    const editorOptions = this.tagbox.instance.option();

                    this.editing.onCustomEditorPreparing({
                        row: this.detailItem,
                        rowIndex: this.detailItemIndex,
                        dataField: this.identifier,
                        column: this.preparedColumn,
                        editorOptions: editorOptions,
                        component: this.tagbox.instance
                    });

                    if (editorOptions) {
                        this.tagbox.instance.option(editorOptions);
                    }
                }
                break;
        }
    }
}
