import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { CrudItem, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { EDIT_SERVICE, EditItemRef, EditService, LOOKUP_SERVICE, LookupService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { DxDataGridComponent, DxToolbarModule, DxTreeListModule } from "devextreme-angular";
import { Item as ToolbarItem } from "devextreme/ui/toolbar";
import { Column, EditorPreparingEvent, InitNewRowEvent, RowValidatingEvent, ToolbarPreparingEvent } from "devextreme/ui/tree_list";
import { combineLatest, takeUntil } from "rxjs";
import { createColumnConfiguration } from "../../utils/columns";
import { CommonModule } from "@angular/common";
import { DynamicColumnComponent } from "../../datacontainer";
import { EditLayoutJsonComponent } from "../json/json.component";
import { Destroy, EditItemLivecycle, UnknownArrayValue, Readonly, Visible } from "@ballware/renderer-commons";

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

export interface DetailTreeItemOptions {  
    add?: boolean;
    update?: boolean;
    delete?: boolean;
    columns: Array<GridLayoutColumn>;
    showSource?: boolean;
  }

@Component({
    selector: 'ballware-edit-detailtree',
    templateUrl: './detailtree.component.html',
    styleUrls: [],
    imports: [CommonModule, DxToolbarModule, DxTreeListModule, DynamicColumnComponent, EditLayoutJsonComponent],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible],
    standalone: true
})
export class EditLayoutDetailTreeComponent implements OnInit {

    @ViewChild('grid', { static: false }) grid?: DxDataGridComponent;

    public options: DetailTreeItemOptions|undefined;
    public height: string|undefined;

    public columns: Column[]|undefined;

    public allowAdd = false;
    public allowUpdate = false;
    public allowDelete = false;
    
    public allowShowSource = false;
    public showSource = false;

    public sourceToolbarItems: ToolbarItem[]|undefined;

    private dataMember: string|undefined;
    private detailGridCellPreparing: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, column: GridLayoutColumn) => void) | undefined;
    private detailGridRowValidating: ((dataMember: string, detailItem: Record<string, unknown>) => string) | undefined;
    private initNewDetailItem: ((dataMember: string, detailItem: Record<string, unknown>) => void) | undefined;

    private detailEditorInitialized: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, component: EditItemRef) => void)|undefined;
    private detailEditorValidating: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, ruleIdentifier: string, value: ValueType) => boolean)|undefined;
    private detailEditorValueChanged: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, value: unknown, notify: boolean) => void)|undefined;
    private detailEditorEntered: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string) => void)|undefined;
    private detailEditorEvent: ((dataMember: string, detailItem: Record<string, unknown>, identifier: string, event: string) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private translator: Translator,
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        @Inject(EDIT_SERVICE) private editService: EditService,
        public destroy: Destroy,
        public livecycle: EditItemLivecycle,
        public readonly: Readonly,
        public value: UnknownArrayValue,
        public visible: Visible
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
      ]
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
        .pipe(takeUntil(this.destroy.destroy$))
        .subscribe(([layoutItem, readonly, mode, item, lookups, 
          detailGridCellPreparing, detailGridRowValidating, initNewDetailItem, detailEditorInitialized, detailEditorValidating, detailEditorEntered, detailEditorEvent, detailEditorValueChanged]) => {
          if (layoutItem && layoutItem.options?.dataMember && mode && item && lookups 
              && detailGridCellPreparing && detailGridRowValidating && initNewDetailItem 
              && detailEditorInitialized && detailEditorValidating && detailEditorEntered && detailEditorEvent && detailEditorValueChanged) {
              this.dataMember = layoutItem.options?.dataMember;
              this.height = layoutItem.options?.height;
              this.options = layoutItem.options?.itemoptions as DetailTreeItemOptions;

              this.allowAdd = (!readonly && (layoutItem.options?.itemoptions as DetailTreeItemOptions).add) ?? false;
              this.allowUpdate = (!readonly && (layoutItem.options?.itemoptions as DetailTreeItemOptions).update) ?? false;
              this.allowDelete = (!readonly && (layoutItem.options?.itemoptions as DetailTreeItemOptions).delete) ?? false;
              this.allowShowSource = (layoutItem.options?.itemoptions as DetailTreeItemOptions).showSource ?? false;

              this.detailGridCellPreparing = (dataMember, detailItem, identifier, column) => detailGridCellPreparing({ dataMember, detailItem, identifier, options: column });
              this.detailGridRowValidating = (dataMember, detailItem) => detailGridRowValidating({ dataMember, detailItem });
              this.initNewDetailItem = (dataMember, detailItem) => initNewDetailItem({ dataMember, detailItem });
              
              this.detailEditorInitialized = (dataMember, detailItem, identifier, component) => detailEditorInitialized({ dataMember, detailItem, identifier, component });
              this.detailEditorValidating = (dataMember, detailItem, identifier, ruleIdentifier, value) => detailEditorValidating({ dataMember, detailItem, identifier, ruleIdentifier, value });
              this.detailEditorEntered = (dataMember, detailItem, identifier) => detailEditorEntered({ dataMember, detailItem, identifier });
              this.detailEditorValueChanged = (dataMember, detailItem, identifier, value, notify) => detailEditorValueChanged({ dataMember, detailItem, identifier, value, notify });
              this.detailEditorEvent = (dataMember, detailItem, identifier, event) => detailEditorEvent({ dataMember, detailItem, identifier, event });

              this.columns = createColumnConfiguration<Column>(
                  (key, options) => this.translator(key, options),
                  this.options.columns,                    
                  lookups,
                  item,
                  'detail',
                  undefined,
                  undefined
              );
          }
        });      
    }

    public onToolbarPreparing(e: ToolbarPreparingEvent) {
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

    public onEditorPreparing(e: EditorPreparingEvent) {
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
            this.detailEditorEntered(this.dataMember, e.row.data, e.dataField);
          }
        };

        e.editorOptions.onFocusOut = (args: unknown) => {
          if (defaultFocusOut) defaultFocusOut(args);

          if (this.grid?.instance.hasEditData()) {
            this.grid?.instance.saveEditData();
          }
        }

        e.editorOptions.onInitialized = (args: { component: EditComponentWithOptions }) => {
          if (this.dataMember && this.detailEditorInitialized && e.row && e.dataField) {
            this.detailEditorInitialized(
              this.dataMember,
              e.row.data,
              e.dataField,
              componentToEditItemRef(args.component)
            );
          }
        };

        e.editorOptions.valueChangeEvent = 'blur change focusout keyup';
      } 
    }

    public onInitNewRow(e: InitNewRowEvent) {
      if (this.dataMember && this.initNewDetailItem) {
        this.initNewDetailItem(this.dataMember, e.data);
      }
    }

    public onRowValidating(e: RowValidatingEvent) {
      if (this.dataMember && this.detailGridRowValidating) {
        const validatingData = { ...e.oldData, ...e.newData };

        const newErrorText = this.detailGridRowValidating(this.dataMember, validatingData);

        if (newErrorText) {
          e.errorText = newErrorText;
          e.isValid = false;
        }
      }
    }
}