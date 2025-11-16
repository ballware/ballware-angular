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
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, PickvalueCreator, Translator, TRANSLATOR } from "@ballware/meta-services";
import { Readonly } from "@ballware/renderer-commons";
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
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { DetailCollectionEditing } from "../../directives";
import { createLookupDataSource } from "../../utils";
import { DetailEditPopupComponent } from "../detaileditpopup/detaileditpopup.component";
import { compileSetter } from 'devextreme/utils';

@Component({
    selector: 'ballware-detail-dynamic-column',
    templateUrl: './detaildynamiccolumn.component.html',
    styleUrls: ['./detaildynamiccolumn.component.scss'],
    imports: [CommonModule, I18NextModule, DetailEditPopupComponent, DxTextBoxModule, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxSelectBoxModule, DxTagBoxModule, DxValidatorModule],
    standalone: true
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
    value: unknown|undefined = undefined;
    lookupDatasource: DataSource|object[]|undefined;
    lookupValueExpr: string|undefined;
    lookupDisplayExpr: string|undefined;
    acceptCustomValue: boolean|undefined;
    lookup: LookupDescriptor|undefined;

    private _lookupItemKeyValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined;
    private _lookupItemDisplayValueSetter: ((item: Record<string, unknown>, value: string) => void)|undefined;

    public requiredValidation$ = new BehaviorSubject<boolean>(false);

    public validationRules$: Observable<Array<ValidationRule>>|undefined;

    onValueChanged: ((e: TextValueChangedEvent|BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|LookupValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private translator: Translator,
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        @Inject(EDIT_SERVICE) private editService: EditService,
        private destroy: DestroyRef,
        public readonly: Readonly,
        private editing: DetailCollectionEditing) {
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

                  this.acceptCustomValue = this.preparedColumn.acceptCustomValue ?? false;

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

                    if (this.preparedColumn.lookup) {
                      const foundLookup = lookups[this.preparedColumn.lookup];

                      if (foundLookup as LookupCreator && this.preparedColumn.lookupParam) {
                        const dynamicLookupParam = (get(this.item, this.preparedColumn.lookupParam) ?? this.preparedColumn.lookupParam) as string;

                        this.lookup = (foundLookup as LookupCreator)(dynamicLookupParam);
                      } else if (foundLookup as PickvalueCreator && this.preparedColumn.pickvalueEntity && this.preparedColumn.pickvalueField) {
                        const dynamicPickvalueEntity = (get(this.item, this.preparedColumn.pickvalueEntity) ?? this.preparedColumn.pickvalueEntity) as string;
                        const dynamicPickvalueField = (get(this.item, this.preparedColumn.pickvalueField) ?? this.preparedColumn.pickvalueField) as string;

                        this.lookup = (foundLookup as PickvalueCreator)(dynamicPickvalueEntity, dynamicPickvalueField);
                      } else if (foundLookup as LookupDescriptor) {
                        this.lookup = foundLookup as LookupDescriptor;
                      }

                      if (!this.lookup) {
                        this.lookup = getGenericLookupByIdentifier(this.preparedColumn.lookup, this.preparedColumn.valueExpr ?? 'Id', this.preparedColumn.displayExpr ?? 'Name');
                      }

                      if (this.lookup) {
                        this.lookupDatasource = createLookupDataSource(
                          (this.lookup.store as LookupStoreDescriptor).listFunc,
                          (this.lookup.store as LookupStoreDescriptor).byIdFunc
                        );

                        this.lookupValueExpr = this.preparedColumn.valueExpr ?? this.lookup.valueMember ?? 'Id';
                        this.lookupDisplayExpr = this.preparedColumn.displayExpr ?? this.lookup.displayMember ?? 'Name';

                        if (this.lookup.type !== 'autocomplete') {
                          const keyValueSetter = compileSetter(this.lookupValueExpr ?? (this.lookup as LookupDescriptor)?.valueMember ?? this.lookupDatasource?.key() ?? 'Id');

                          this._lookupItemKeyValueSetter = (item, value) => keyValueSetter(item, value);

                          const displayValueSetter = compileSetter(this.lookupDisplayExpr ?? (this.lookup as LookupDescriptor)?.displayMember ?? 'Name');

                          this._lookupItemDisplayValueSetter = (item, value) => displayValueSetter(item, value);
                        }
                      } else {
                        this.lookupDatasource = undefined;
                      }
                    }
                  }
                }
            });
    }

  public onCustomItemCreating(event: any) {
    if (!this.acceptCustomValue) {
      event.cancel = true;
      return;
    }

    if (this.lookup?.type === 'autocomplete') {
      event.customItem = event.text;
    } else {
      const customValue = {

      };

      this._lookupItemKeyValueSetter?.(customValue, event.text);
      this._lookupItemDisplayValueSetter?.(customValue, event.text);

      event.customItem = customValue;
    }
  }
}
