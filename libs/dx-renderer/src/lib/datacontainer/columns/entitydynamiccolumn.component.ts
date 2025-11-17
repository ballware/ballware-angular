import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditUtil, GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, META_SERVICE, MetaService, PickvalueCreator } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { createLookupDataSource } from "../../utils";
import { CommonModule } from "@angular/common";
import { DxCheckBoxComponent, DxCheckBoxModule, DxDateBoxComponent, DxDateBoxModule, DxNumberBoxComponent, DxNumberBoxModule, DxTagBoxComponent, DxTagBoxModule } from "devextreme-angular";
import { DetailEditPopupComponent } from "../detaileditpopup/detaileditpopup.component";
import { I18NextModule } from "angular-i18next";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-dynamic-column',
    templateUrl: './entitydynamiccolumn.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DetailEditPopupComponent, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxTagBoxModule]
})
export class EntityDynamicColumnComponent implements OnInit {
    @ViewChild('checkbox', { static: false }) checkbox?: DxCheckBoxComponent;
    @ViewChild('numberbox', { static: false }) numberbox?: DxNumberBoxComponent;
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;
    @ViewChild('datetimebox', { static: false }) datetimebox?: DxDateBoxComponent;
    @ViewChild('statictagbox', { static: false }) statictagbox?: DxTagBoxComponent;
    @ViewChild('tagbox', { static: false }) tagbox?: DxTagBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() lookupParams!: Record<string, unknown>;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown|undefined = undefined;
    lookupDatasource: DataSource|object[]|undefined;
    lookupValueExpr: string|undefined;
    lookupDisplayExpr: string|undefined;

    onValueChanged: ((e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        private destroy: DestroyRef,
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        @Inject(META_SERVICE) private metaService: MetaService) {
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

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember);
        }

        combineLatest([
            this.lookupService.lookups$,
            this.lookupService.getGenericLookupByIdentifier$,
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([lookups, getGenericLookupByIdentifier, editorValueChanged]) => {
          if (lookups && getGenericLookupByIdentifier && editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember);

                  editorValueChanged(!this.readonly ? EditModes.EDIT : EditModes.VIEW, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;

              if (this.preparedColumn.type === 'staticmultilookup') {
                  this.lookupDatasource = this.preparedColumn.items ??
                      (this.preparedColumn.itemsMember ? get(this.item, this.preparedColumn.itemsMember)
                          : (this.preparedColumn.lookupMember ? get(this.lookupParams, this.preparedColumn.lookupMember) : undefined)) as Array<object>;

                  this.lookupValueExpr = this.preparedColumn.valueExpr ?? 'Value';
                  this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? 'Text';
              } else if (this.preparedColumn.type === 'multilookup') {
                  let lookup: LookupDescriptor|undefined = undefined;

                  if (this.preparedColumn.lookup) {
                      const foundLookup = lookups[this.preparedColumn.lookup];

                      if (foundLookup as LookupCreator && this.preparedColumn.lookupParam) {
                          const dynamicLookupParam = (get(this.lookupParams, this.preparedColumn.lookupParam) ?? this.preparedColumn.lookupParam) as string;

                          lookup = (foundLookup as LookupCreator)(dynamicLookupParam);
                      } else if (foundLookup as PickvalueCreator && this.preparedColumn.pickvalueEntity && this.preparedColumn.pickvalueField) {
                          const dynamicPickvalueEntity = (get(this.lookupParams, this.preparedColumn.pickvalueEntity) ?? this.preparedColumn.pickvalueEntity) as string;
                          const dynamicPickvalueField = (get(this.lookupParams, this.preparedColumn.pickvalueField) ?? this.preparedColumn.pickvalueField) as string;

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
