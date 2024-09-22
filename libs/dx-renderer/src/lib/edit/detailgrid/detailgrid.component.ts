import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { CrudItem, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { EDIT_SERVICE, EditItemRef, EditService, LOOKUP_SERVICE, LookupService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { DxDataGridComponent, DxDataGridModule, DxToolbarModule, DxValidatorModule } from "devextreme-angular";
import { ValidationCallbackData } from "devextreme/common";
import { Column, DataChange, EditorPreparingEvent, InitNewRowEvent, RowClickEvent, RowValidatingEvent, ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import { Item as ToolbarItem } from "devextreme/ui/toolbar";
import { combineLatest, takeUntil } from "rxjs";
import { createColumnConfiguration } from "../../utils/columns";
import { CommonModule } from "@angular/common";
import { DynamicColumnComponent } from "../../datacontainer";
import { EditLayoutJsonComponent } from "../json/json.component";
import { I18NextModule } from "angular-i18next";
import { Destroy, EditItemLivecycle, Readonly, UnknownArrayValue, Visible } from "@ballware/renderer-commons";

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

export interface DetailGridItemOptions {  
    add?: boolean;
    update?: boolean;
    delete?: boolean;
    columns: Array<GridLayoutColumn>;
    showSource?: boolean;
  }

@Component({
    selector: 'ballware-edit-detailgrid',
    templateUrl: './detailgrid.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DxDataGridModule, DxValidatorModule, DxToolbarModule, DynamicColumnComponent, EditLayoutJsonComponent],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Visible],
    standalone: true
})
export class EditLayoutDetailGridComponent implements OnInit {

    @ViewChild('grid', { static: false }) grid?: DxDataGridComponent;

    public options: DetailGridItemOptions|undefined;
    public height: string|undefined;

    public lookupParams: Record<string, unknown>|undefined;

    public columns: Column[]|undefined;

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

    public gridEditChanges: DataChange<any, any>[] = [];
    public gridEditRowKey: number|null = null;
    
    /*{        
        applyValidationResults?: Function | undefined;
        bypass?: Function | undefined;
        focus?: Function | undefined;
        getValue?: Function | undefined;
        reset?: Function | undefined;
        validationRequestsCallbacks?: Function[] | undefined;
    }|undefined;*/
    
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

      this.onGridValidateNotEditing = this.onGridValidateNotEditing.bind(this);

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
              this.options = layoutItem.options?.itemoptions as DetailGridItemOptions;
              this.lookupParams = item;

              this.allowAdd = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).add) ?? false;
              this.allowUpdate = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).update) ?? false;
              this.allowDelete = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).delete) ?? false;
              this.allowShowSource = (layoutItem.options?.itemoptions as DetailGridItemOptions).showSource ?? false;

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

          //if (this.grid?.instance.hasEditData()) {
          //  this.grid?.instance.saveEditData();
          //}
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

    public onRowClick(e: RowClickEvent) {      
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

    public onGridValidateNotEditing(options: ValidationCallbackData) {

      if (this.grid?.instance.hasEditData()) {
        if ((this.grid?.instance as any).getController('validating').validate()) {
          this.grid?.instance.saveEditData();
        }
      }

      return !this.grid?.instance.hasEditData();
    }  
}