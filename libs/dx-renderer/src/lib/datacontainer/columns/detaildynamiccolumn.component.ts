import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, META_SERVICE, MetaService, PickvalueCreator } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { get } from "lodash";
import { combineLatest, takeUntil } from "rxjs";
import { createLookupDataSource } from "../../utils";
import { WithDestroy } from "../../utils/withdestroy";
import { CommonModule } from "@angular/common";
import { DxCheckBoxComponent, DxCheckBoxModule, DxDateBoxComponent, DxDateBoxModule, DxNumberBoxComponent, DxNumberBoxModule, DxTagBoxComponent, DxTagBoxModule } from "devextreme-angular";
import { DetailEditPopupComponent } from "../detaileditpopup/detaileditpopup.component";
import { I18NextModule } from "angular-i18next";
import { DetailCollectionEditing } from "../../directives";

@Component({
    selector: 'ballware-detail-dynamic-column',
    templateUrl: './detaildynamiccolumn.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DetailEditPopupComponent, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxTagBoxModule],
    standalone: true
})
export class DetailDynamicColumnComponent extends WithDestroy() implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('checkbox', { static: false }) checkbox?: DxCheckBoxComponent;
    @ViewChild('numberbox', { static: false }) numberbox?: DxNumberBoxComponent;
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;
    @ViewChild('datetimebox', { static: false }) datetimebox?: DxDateBoxComponent;
    @ViewChild('statictagbox', { static: false }) statictagbox?: DxTagBoxComponent;
    @ViewChild('tagbox', { static: false }) tagbox?: DxTagBoxComponent;

    @Input() dataMember!: string;
    @Input() identifier!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() detailItem!: Record<string, unknown>;
    @Input() detailItemIndex!: number;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown|undefined = undefined;
    lookupDatasource: DataSource|object[]|undefined;
    lookupValueExpr: string|undefined;
    lookupDisplayExpr: string|undefined;

    onValueChanged: ((e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        @Inject(META_SERVICE) private metaService: MetaService,
        private editing: DetailCollectionEditing) {
        super();
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

    multiLookupValue() {
        return this.value as Array<any>;
    }

    getEditorOption(option: string): unknown {
        switch (this.preparedColumn?.type) {
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

        if (this.detailItem && this.identifier) {
            this.value = get(this.detailItem, this.identifier);
        }

        combineLatest([
            this.lookupService.lookups$,
            this.lookupService.getGenericLookupByIdentifier$,
            this.metaService.detailGridCellPreparing$,
            this.metaService.editorValueChanged$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([lookups, getGenericLookupByIdentifier, detailGridCellPreparing, editorValueChanged]) => {
                if (lookups && getGenericLookupByIdentifier && detailGridCellPreparing && editorValueChanged) {
                  this.preparedColumn = detailGridCellPreparing(!this.readonly ? EditModes.EDIT : EditModes.VIEW, this.item, this.detailItem, this.identifier, this.column);

                  this.prepared = true;

                  if (this.preparedColumn.type === 'staticmultilookup') {
                    this.lookupDatasource = this.preparedColumn.items ??
                      (this.preparedColumn.itemsMember ? get(this.item, this.preparedColumn.itemsMember)
                        : (this.preparedColumn.lookupMember ? get(this.item, this.preparedColumn.lookupMember) : undefined)) as Array<object>;

                    this.lookupValueExpr = this.preparedColumn.valueExpr ?? 'Value';
                    this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? 'Text';
                  } else if (this.preparedColumn.type === 'multilookup') {
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

                    break;
                }
                break;
        }
    }
}
