import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, MetaService } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { cloneDeep } from "lodash";
import { combineLatest, takeUntil } from "rxjs";
import { getByPath, setByPath } from "../../utils/databinding";
import { createLookupDataSource } from "../../utils/datasource";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-edit-dynamic-column',
    templateUrl: './dynamiccolumn.component.html',
    styleUrls: ['./dynamiccolumn.component.scss']
})
export class DynamicColumnComponent extends WithDestroy() implements OnInit, OnDestroy { 
    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() lookupParams!: Record<string, unknown>;
    @Input() item!: Record<string, unknown>;
    @Input() editing!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown|undefined = undefined;
    lookupDatasource: DataSource|object[]|undefined;
    lookupValueExpr: string|undefined;
    lookupDisplayExpr: string|undefined;

    constructor(private lookupService: LookupService, private metaService: MetaService) {
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

    onValueChanged(e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) {                
        setByPath(this.item, this.dataMember, e.value);
        this.value = getByPath(this.item, this.dataMember);
    }


    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = getByPath(this.item, this.dataMember);
        }
        
        combineLatest([this.lookupService.lookups$, this.lookupService.getGenericLookupByIdentifier$, this.metaService.detailGridCellPreparing$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([lookups, getGenericLookupByIdentifier, detailGridCellPreparing]) => {
                if (lookups && getGenericLookupByIdentifier && detailGridCellPreparing) {
                    const preparedColumn = cloneDeep(this.column);
                    
                    detailGridCellPreparing(this.editing ? EditModes.EDIT : EditModes.VIEW, this.lookupParams, this.item, this.dataMember, preparedColumn);

                    this.preparedColumn = preparedColumn;
                    this.prepared = true;

                    if (this.preparedColumn.type === 'staticmultilookup') {
                        this.lookupDatasource = this.preparedColumn.items ?? 
                            (this.preparedColumn.itemsMember ? getByPath(this.item, this.preparedColumn.itemsMember) 
                                : (this.preparedColumn.lookupMember ? getByPath(this.lookupParams, this.preparedColumn.lookupMember) : undefined)) as Array<object>;
                        
                        this.lookupValueExpr = this.preparedColumn.valueExpr ?? 'Value';
                        this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? 'Text';
                    } else if (this.preparedColumn.type === 'multilookup') {
                        let lookup: LookupDescriptor|undefined = undefined;
                        
                        if (this.preparedColumn.lookup) {
                            const foundLookup = lookups[this.preparedColumn.lookup];

                            if (foundLookup as LookupCreator && this.preparedColumn.lookupParam) {
                                lookup = (foundLookup as LookupCreator)(getByPath(this.lookupParams, this.preparedColumn.lookupParam) as string);
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

                                this.lookupValueExpr = this.preparedColumn.valueExpr ?? lookup.valueMember  ?? 'Id';
                                this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? lookup.displayMember ?? 'Name';
                            } else {
                                this.lookupDatasource = undefined;
                            }
                        }
                    }
                }                
            });
    }
}