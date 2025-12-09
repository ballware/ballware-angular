import { DestroyRef, Directive, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EDIT_SERVICE, EditItemRef, EditService, LOOKUP_SERVICE, LookupService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { EditItemLivecycle, Readonly, UnknownArrayValue } from "@ballware/renderer-commons";

import { CrudItem, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { ValidationCallbackData } from 'devextreme/common';
import { Column as DataGridColumn, DataChange as DataGridDataChange, EditorPreparingEvent as DataGridEditorPreparingEvent, InitNewRowEvent as DataGridInitNewRowEvent, RowClickEvent as DataGridRowClickEvent, ToolbarPreparingEvent as DataGridToolbarPreparingEvent } from "devextreme/ui/data_grid";
import { Item as ToolbarItem } from "devextreme/ui/toolbar";
import { Column as TreeListColumn, DataChange as TreeListDataChange, EditorPreparingEvent as TreeListEditorPreparingEvent, InitNewRowEvent as TreeListInitNewRowEvent, RowClickEvent as TreelistRowClickEvent, ToolbarPreparingEvent as TreeListToolbarPreparingEvent } from "devextreme/ui/tree_list";
import { combineLatest, Observable, of } from 'rxjs';
import { createColumnConfiguration } from "../utils";

type ColumnType = DataGridColumn | TreeListColumn;

interface EditComponentWithOptions {
    /**
      * Gets the value of a single property.
      */
    option<TPropertyName extends string, TValue = unknown>(optionName: TPropertyName): TValue;
    /**
      * Updates the value of a single property.
      */
    option<TPropertyName extends string, TValue = unknown>(optionName: TPropertyName, optionValue: TValue): void;
}

const componentToEditItemRef = (component: EditComponentWithOptions) => {
    return {
        getOption: option => component.option(option),
        setOption: (option, value) => component.option(option, value),
    } as EditItemRef;
};

export interface DetailCollectionEditingOptions {
    add?: boolean;
    update?: boolean;
    delete?: boolean;
    editMode?: 'row' | 'instant';
    columns: Array<GridLayoutColumn>;
    showSource?: boolean;
}

@Directive({
    standalone: true
})
export class DetailCollectionEditing implements OnInit {

    public options: DetailCollectionEditingOptions|undefined;
    public height: string|undefined;

    public lookupParams: Record<string, unknown>|undefined;

    public columns: ColumnType[]|undefined;

    public editMode: 'row' | 'instant' = 'row';
    public allowAdd = false;
    public allowUpdate = false;
    public allowDelete = false;

    public allowShowSource = false;
    public showSource = false;

    public sourceToolbarItems: ToolbarItem[]|undefined;

    public validationAdapterConfig = {
        getValue: () => ({
          editChanges: this.gridEditChanges
        })
    };

    public gridEditChanges: (DataGridDataChange<any, any>|TreeListDataChange<any, any>)[] = [];
    public gridEditRowKey: number|null = null;

    private dataMember: string|undefined;

    private detailGridCellPreparing: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, column: GridLayoutColumn) => GridLayoutColumn) | undefined;
    private detailGridRowValidating: ((dataMember: string, detailItem: Record<string, unknown>) => Observable<string|undefined>) | undefined;
    private initNewDetailItem: ((dataMember: string, detailItem: Record<string, unknown>) => void) | undefined;

    private detailEditorInitialized: ((dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, component: EditItemRef) => void)|undefined;
    private detailEditorValidating: ((dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, ruleIdentifier: string, value: ValueType) => Observable<boolean>)|undefined;
    public detailEditorValueChanged: ((dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, value: unknown, notify: boolean) => void)|undefined;
    private detailEditorEntered: ((dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string) => void)|undefined;
    public detailEditorEvent: ((dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, event: string) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
        @Inject(EDIT_SERVICE) private readonly editService: EditService,
        private readonly destroy: DestroyRef,
        private readonly livecycle: EditItemLivecycle,
        private readonly readonly: Readonly,
        private readonly value: UnknownArrayValue
    ) {
        this.sourceToolbarItems = [
            {
              locateInMenu: 'auto',
              location: 'after',
              widget: 'dxButton',
              showText: 'inMenu',
              options: {
                hint: this.translator('datacontainer.actions.showList'),
                text: this.translator('datacontainer.actions.showList'),
                icon: 'bi bi-table',
                onClick: () => {
                  this.showSource = false;
                  this.value.refreshValue();
                },
              },
            } as ToolbarItem
        ];
    }

    ngOnInit(): void {
        combineLatest([this.livecycle.preparedLayoutItem$, this.readonly.readonly$, this.editService.mode$, this.editService.item$,
            this.lookupService.lookups$,
            this.editService.detailGridCellPreparing$,
            this.editService.detailGridRowValidating$,
            this.editService.initNewDetailItem$,
            this.editService.detailEditorInitialized$,
            this.editService.detailEditorValidating$,
            this.editService.detailEditorEntered$,
            this.editService.detailEditorEvent$,
            this.editService.detailEditorValueChanged$])
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe(([layoutItem, readonly, mode, item, lookups,
                detailGridCellPreparing, detailGridRowValidating, initNewDetailItem, detailEditorInitialized, detailEditorValidating, detailEditorEntered, detailEditorEvent, detailEditorValueChanged]) => {
                if (layoutItem?.options?.dataMember && mode && item && lookups
                    && detailGridCellPreparing && detailGridRowValidating && initNewDetailItem
                    && detailEditorInitialized && detailEditorValidating && detailEditorEntered && detailEditorEvent && detailEditorValueChanged) {
                    this.dataMember = layoutItem.options?.dataMember;
                    this.height = layoutItem.options?.height;
                    this.options = layoutItem.options?.itemoptions as DetailCollectionEditingOptions;
                    this.lookupParams = item;

                    this.editMode = (readonly) ? 'row' : this.options?.editMode ?? 'row';
                    this.allowAdd = (!readonly && this.options?.add) ?? false;
                    this.allowUpdate = (!readonly && this.options?.update) ?? false;
                    this.allowDelete = (!readonly && this.options?.delete) ?? false;
                    this.allowShowSource = this.options?.showSource ?? false;

                    this.detailGridCellPreparing = (dataMember, detailItem, identifier, column) => detailGridCellPreparing({ dataMember, detailItem, identifier, options: column });
                    this.detailGridRowValidating = (dataMember, detailItem) => detailGridRowValidating({ dataMember, detailItem });
                    this.initNewDetailItem = (dataMember, detailItem) => initNewDetailItem({ dataMember, detailItem });

                    this.detailEditorInitialized = (dataMember, detailItemIndex, detailItem, identifier, component) => detailEditorInitialized({ dataMember, detailItemIndex, detailItem, identifier, component });
                    this.detailEditorValidating = (dataMember, detailItemIndex, detailItem, identifier, ruleIdentifier, value) => detailEditorValidating({ dataMember, detailItemIndex, detailItem, identifier, ruleIdentifier, value });
                    this.detailEditorEntered = (dataMember, detailItemIndex, detailItem, identifier) => detailEditorEntered({ dataMember, detailItemIndex, detailItem, identifier });
                    this.detailEditorValueChanged = (dataMember, detailItemIndex, detailItem, identifier, value, notify) => detailEditorValueChanged({ dataMember, detailItemIndex, detailItem, identifier, value, notify });
                    this.detailEditorEvent = (dataMember, detailItemIndex, detailItem, identifier, event) => detailEditorEvent({ dataMember, detailItemIndex, detailItem, identifier, event });

                    this.columns = createColumnConfiguration<ColumnType>(
                        (key, options) => this.translator(key, options),
                        this.options.columns,
                        lookups,
                        item,
                        'detail',
                        this.options.editMode ?? 'row',
                        undefined,
                        undefined,
                        this.onDetailRowValidating
                    );
                }
        });
    }

    public onToolbarPreparing(e: DataGridToolbarPreparingEvent|TreeListToolbarPreparingEvent) {
        if (this.allowShowSource) {
          e.toolbarOptions.items?.unshift({
            locateInMenu: 'auto',
            location: 'after',
            widget: 'dxButton',
            showText: 'inMenu',
            options: {
              hint: this.translator('datacontainer.actions.showSource'),
              text: this.translator('datacontainer.actions.showSource'),
              icon: 'bi bi-code',
              onClick: () => {
                this.showSource = true;
              },
            },
          } as ToolbarItem)
        }
      }

      public onIntegratedEditorPreparing(e: DataGridEditorPreparingEvent|TreeListEditorPreparingEvent) {
        if (e.parentType === 'dataRow' && e.row && e.dataField) {
          if (this.dataMember && this.detailGridCellPreparing) {
            this.detailGridCellPreparing(
              this.dataMember,
              e.row.data,
              e.dataField,
              e.editorOptions
            );
          }

          const defaultValueChanged = e.editorOptions.onValueChanged;
          const defaultFocusIn = e.editorOptions.onFocusIn;
          const defaultFocusOut = e.editorOptions.onFocusOut;

          e.editorOptions.onValueChanged = (args: {
            value: CrudItem | ValueType;
          }) => {
            if (defaultValueChanged) defaultValueChanged(args);

            if (
              this.dataMember &&
              this.detailEditorValueChanged &&
              e.row &&
              e.dataField
            ) {
              this.detailEditorValueChanged(
                this.dataMember,
                e.component.getRowIndexByKey(e.row.key),
                e.row.data,
                e.dataField,
                args.value,
                true
              );
            }
          };

          e.editorOptions.onFocusIn = (args: unknown) => {
            if (defaultFocusIn) defaultFocusIn(args);

            if (this.dataMember && this.detailEditorEntered && e.row && e.dataField) {
              this.detailEditorEntered(this.dataMember, e.component.getRowIndexByKey(e.row.key), e.row.data, e.dataField);
            }
          };

          e.editorOptions.onFocusOut = (args: unknown) => {
            if (defaultFocusOut) defaultFocusOut(args);
          }

          e.editorOptions.onInitialized = (args: { component: EditComponentWithOptions }) => {
            if (this.dataMember && this.detailEditorInitialized && e.row && e.dataField) {
              this.detailEditorInitialized(
                this.dataMember,
                e.component.getRowIndexByKey(e.row.key),
                e.row.data,
                e.dataField,
                componentToEditItemRef(args.component)
              );
            }
          };

          e.editorOptions.valueChangeEvent = 'blur change focusout keyup';
        }
      }

      public onRowClick(e: DataGridRowClickEvent|TreelistRowClickEvent) {
        if (this.allowUpdate) {
          if (e.component.hasEditData()) {
            if ((e.component as any).getController('validating').validate()) {
              e.component.saveEditData();
            }
          }

          if (!e.component.hasEditData()) {
            e.component.editRow(e.rowIndex);
          }
        }
      }

      public onInitNewRow(e: DataGridInitNewRowEvent|TreeListInitNewRowEvent) {
        if (this.dataMember && this.initNewDetailItem) {
          this.initNewDetailItem(this.dataMember, e.data);
        }
      }

      readonly onDetailRowValidating = (e: ValidationCallbackData)=> {
        if (this.dataMember && this.detailGridRowValidating) {

          const validatingData = { ...e.data };

          return this.detailGridRowValidating(this.dataMember, validatingData);
        }

        return of(undefined);
      }
}
