import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { CrudItem, EditLayoutItem, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { EditItemRef, EditService, LOOKUP_SERVICE, LookupService, RESPONSIVE_SERVICE, ResponsiveService } from "@ballware/meta-services";
import { I18NextPipe, PipeOptions } from "angular-i18next";
import { DxDataGridComponent } from "devextreme-angular";
import { ValidationCallbackData } from "devextreme/common";
import { Column, DataChange, EditorPreparingEvent, InitNewRowEvent, RowClickEvent, RowValidatingEvent, ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import { dxToolbarItem } from "devextreme/ui/toolbar";
import { combineLatest, takeUntil } from "rxjs";
import { createColumnConfiguration } from "../../utils/columns";
import { WithDestroy } from "../../utils/withdestroy";
import { WithEditItemLifecycle } from "../../utils/withedititemlivecycle";
import { WithReadonly } from "../../utils/withreadonly";
import { WithValue } from "../../utils/withvalue";
import { WithVisible } from "../../utils/withvisible";

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
    styleUrls: ['./detailgrid.component.scss']
})
export class EditLayoutDetailGridComponent extends WithVisible(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => []))) implements OnInit, EditItemRef {

    @ViewChild('grid', { static: false }) grid?: DxDataGridComponent;

    @Input() initialLayoutItem?: EditLayoutItem;
  
    public layoutItem: EditLayoutItem|undefined;
    public options: DetailGridItemOptions|undefined;
    public height: string|undefined;

    public lookupParams: Record<string, unknown>|undefined;

    public columns: Column[]|undefined;

    public allowAdd = false;
    public allowUpdate = false;
    public allowDelete = false;

    public allowShowSource = false;
    public showSource = false;

    public sourceToolbarItems: dxToolbarItem[]|undefined;

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
        private translationService: I18NextPipe,
        @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService,
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
        private editService: EditService) {
      super();

      this.onGridValidateNotEditing = this.onGridValidateNotEditing.bind(this);

      this.sourceToolbarItems = [
        {
          locateInMenu: 'auto',
          location: 'after',
          widget: 'dxButton',
          showText: 'inMenu',
          options: {
            hint: this.translationService.transform('datacontainer.actions.showList'),
            text: this.translationService.transform('datacontainer.actions.showList'),
            icon: 'bi bi-table',
            onClick: () => {              
              this.showSource = false;
              this.refreshValue();
            },
          },
        } as dxToolbarItem
      ]
    }
  
    ngOnInit(): void {
      if (this.initialLayoutItem) {
        this.initLifecycle(this.initialLayoutItem, this.editService, this);
  
        this.preparedLayoutItem$
          .pipe(takeUntil(this.destroy$))
          .subscribe((layoutItem) => {
            if (layoutItem) {
              this.initValue(layoutItem, this.editService);
              this.initReadonly(layoutItem, this.editService);
              this.initVisible(layoutItem);
            }            
          });

        combineLatest([this.preparedLayoutItem$, this.readonly$, this.editService.mode$, this.editService.item$, 
          this.lookupService.lookups$, 
          this.editService.detailGridCellPreparing$, 
          this.editService.detailGridRowValidating$, 
          this.editService.initNewDetailItem$, 
          this.editService.detailEditorInitialized$, 
          this.editService.detailEditorValidating$, 
          this.editService.detailEditorEntered$, 
          this.editService.detailEditorEvent$, 
          this.editService.detailEditorValueChanged$])
          .pipe(takeUntil(this.destroy$))
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
                    (key: string, options?: PipeOptions) => this.translationService.transform(key, options),
                    this.options.columns,                    
                    lookups,
                    item,
                    'detail',
                    undefined,
                    undefined
                );
    
                this.layoutItem = layoutItem;
            }
          });
      }
    }

    public onToolbarPreparing(e: ToolbarPreparingEvent) {
      if (this.allowShowSource) {
        e.toolbarOptions.items?.unshift({
          locateInMenu: 'auto',
          location: 'after',
          widget: 'dxButton',
          showText: 'inMenu',
          options: {
            hint: this.translationService.transform('datacontainer.actions.showSource'),
            text: this.translationService.transform('datacontainer.actions.showSource'),
            icon: 'bi bi-code',
            onClick: () => {
              this.showSource = true;
            },
          },
        } as dxToolbarItem)
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
  
    public getOption(option: string): any {
      switch (option) {
        case 'value':
          return this.value;
        case 'readonly':
          return this.readonly$.getValue();
        case 'visible':
          return this.visible$.getValue();                  
      }
  
      return undefined;
    }
  
    public setOption(option: string, value: unknown) {
      switch (option) {
        case 'value':
          this.setValueWithoutNotification(value as []);
          break;
        case 'readonly':
          this.setReadonly(value as boolean)
          break;
        case 'visible':
          this.setVisible(value as boolean);
          break;          
      }
    }

}