import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudItem, EditUtil, EntityCustomFunction, GridLayout, ValueType } from '@ballware/meta-model';
import { CrudService, EditModes, MetaService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import DataSource from 'devextreme/data/data_source';
import { EditingStartEvent, EditorPreparingEvent, RowDblClickEvent, RowExpandingEvent, SelectionChangedEvent, ToolbarPreparingEvent, dxDataGridColumn } from 'devextreme/ui/data_grid';
import { dxToolbarItem } from 'devextreme/ui/toolbar';
import { combineLatest, takeUntil } from 'rxjs';
import { WithDestroy } from '../../../utils/withdestroy';

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

export interface DatagridSummary {
  totalItems: Array<{
    column: string,
    summaryType: string,
    valueFormat?: string
  }>,
  groupItems: Array<{
    column: string,
    summaryType: string,
    valueFormat?: string
  }>
}

@Component({
  selector: 'ballware-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent extends WithDestroy() implements OnInit {

  @Input() identifier?: string;
  @Input() height!: string;
  @Input() mode!: 'large' | 'medium' | 'small';
  @Input() layout: GridLayout|undefined;
  @Input() columns: Array<dxDataGridColumn>|undefined;
  @Input() summary: DatagridSummary|undefined;
  @Input() dataSource!: DataSource;
  @Input() exportFileName!: string;
  @Input() showReload!: boolean;
  @Input() showAdd!: boolean;
  @Input() showPrint!: boolean;
  @Input() showExport!: boolean;
  @Input() showImport!: boolean;
  @Input() customFunctions!: Array<EntityCustomFunction>;

  @Output() reloadClick = new EventEmitter<{ target: Element }>();
  @Output() addClick = new EventEmitter<{ target: Element }>();
  @Output() printClick = new EventEmitter<{ items: Array<CrudItem>, target: Element }>();
  @Output() exportClick = new EventEmitter<{ items: Array<CrudItem>, target: Element }>();
  @Output() importClick = new EventEmitter<{ items: Array<CrudItem>, target: Element }>();
  @Output() customFunctionClick = new EventEmitter<{ items: Array<CrudItem>, target: Element, customFunction: EntityCustomFunction }>();
  @Output() rowDblClick = new EventEmitter<RowDblClickEvent>();
  @Input() isMasterDetailExpandable?: (e: {
      data: CrudItem
    }) => boolean;

  private displayName?: string;  
  private editAllowed: ((item: CrudItem) => boolean)|undefined;
  private editorEntered: ((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined;
  private editorValueChanged: ((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType) => void)|undefined;
   
  public selectedRowKeys: string[] = [];
  public selectedRowData: CrudItem[] = [];

  public initialized = false;

  constructor(private metaService: MetaService,
    private crudService: CrudService,
    private i18next: I18NextPipe) {
    super();
  }

  ngOnInit(): void {
    combineLatest([this.metaService.editorEntered$, this.metaService.editorValueChanged$, this.metaService.editFunction$, this.metaService.customFunctionAllowed$, this.metaService.displayName$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([editorEntered, editorValueChanged, editFunction, customFunctionAllowed, displayName]) => {
        if (editorEntered && editorValueChanged && customFunctionAllowed && displayName) {
          this.displayName = displayName;
          this.editAllowed = (item) => editFunction ? customFunctionAllowed(editFunction, item) : false;
          this.editorEntered = editorEntered;
          this.editorValueChanged = editorValueChanged;
          this.initialized = true;
        }
      });
  }

  public get style(): string {
    return `height: ${this.height ?? '100%'}`;
  }

  public editingStart(e: EditingStartEvent) {
    e.cancel = !e.data || !this.editAllowed || !this.editAllowed(e.data);
    
    if (!e.cancel && e.column) {
      const column = this.layout?.columns.find(c => c.dataMember === e.column?.dataField);

      if (column && column.editFunction) {
        e.cancel = true;

        const customFunction = this.customFunctions.find(cf => cf.id === column.editFunction);

        if (customFunction && e.data) {
          this.crudService.customEdit({ customFunction, items: [e.data]})
        }
      }
    }
  }

  public gridEditorPreparing(e: EditorPreparingEvent) {
    if (e.parentType === 'dataRow') {
      const defaultValueChanged = e.editorOptions.onValueChanged;
      const defaultFocusIn = e.editorOptions.onFocusIn;

      e.editorOptions.onValueChanged = (args: {
        component: EditComponentWithOptions,
        value: ValueType;
      }) => {
        if (defaultValueChanged) defaultValueChanged(args);

        const editUtil = {
          getEditorOption: (dataMember, option) =>
            dataMember === e.dataField ? args.component.option(option) : null,
          setEditorOption: (dataMember, option, value) => {
            if (dataMember === e.dataField) {
              args.component.option(option, value);
            }
          },
        } as EditUtil;

        if (this.editorValueChanged && e.row && e.dataField) {
          this.editorValueChanged(
            EditModes.EDIT,
            e.row.data,
            editUtil,
            e.dataField,
            args.value
          );
        }
      };

      e.editorOptions.onFocusIn = (args: { component: EditComponentWithOptions }) => {
        if (defaultFocusIn) defaultFocusIn(args);

        const editUtil = {
          getEditorOption: (dataMember, option) =>
            dataMember === e.dataField ? args.component.option(option) : null,
          setEditorOption: (dataMember, option, value) => {
            if (dataMember === e.dataField) {
              args.component.option(option, value);
            }
          },
        } as EditUtil;

        if (this.editorEntered && e.row && e.dataField) {
          this.editorEntered(EditModes.EDIT, e.row.data, editUtil, e.dataField);
        }
      };
    }
  }

  public selectionChanged(e: SelectionChangedEvent) {
    this.selectedRowKeys = e.selectedRowKeys as string[];
    this.selectedRowData = e.selectedRowsData as CrudItem[];
  }

  public toolbarPreparing(e: ToolbarPreparingEvent) {

    if (this.showReload && e.toolbarOptions?.items) {
      e.toolbarOptions.items.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: this.i18next.transform('datacontainer.actions.refresh'),
          text: this.i18next.transform('datacontainer.actions.refresh'),
          icon: 'bi bi-arrow-repeat',
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.reloadClick.emit({ target: e.event.currentTarget });
          },
        },
      } as dxToolbarItem);
    }

    if (this.showPrint && e.toolbarOptions?.items) {
      e.toolbarOptions.items.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: this.i18next.transform('datacontainer.actions.print'),
          text: this.i18next.transform('datacontainer.actions.print'),
          icon: 'bi bi-printer-fill',
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.printClick.emit({
              items: this.selectedRowData,
              target: e.event.currentTarget,
            });
          },
        },
      });
    }

    if (this.showImport && e.toolbarOptions?.items) {
      e.toolbarOptions.items.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: this.i18next.transform('datacontainer.actions.import'),
          text: this.i18next.transform('datacontainer.actions.import'),
          icon: 'bi bi-upload',
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.importClick.emit({
              items: this.selectedRowData,
              target: e.event.currentTarget,
            });
          },
        },
      });
    }

    if (this.showExport && e.toolbarOptions?.items) {
      e.toolbarOptions.items.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: this.i18next.transform('datacontainer.actions.export'),
          text: this.i18next.transform('datacontainer.actions.export'),
          icon: 'bi bi-download',
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.exportClick.emit({
              items: this.selectedRowData,
              target: e.event.currentTarget,
            });
          },
        },
      });
    }

    this.customFunctions?.forEach(f => {
      e.toolbarOptions?.items?.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: `${f.text}`,
          text: `${f.text}`,
          icon: f.icon,
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.customFunctionClick.emit({
              customFunction: f,
              items: this.selectedRowData,
              target: e.event.currentTarget,
            });
          },
        },
      } as dxToolbarItem);
    });

    if (this.showAdd) {
      e.toolbarOptions?.items?.unshift({
        locateInMenu: 'auto',
        location: 'after',
        widget: 'dxButton',
        showText: 'inMenu',
        options: {
          hint: this.i18next.transform('datacontainer.actions.add', { entity: this.displayName }),
          text: this.i18next.transform('datacontainer.actions.add', { entity: this.displayName }),
          icon: 'bi bi-plus',
          onClick: (e: { event: { currentTarget: Element } }) => {
            this.addClick.emit({ target: e.event.currentTarget });
          },
        },
      });
    }
  }

  public rowExpanding(e: RowExpandingEvent) {
    const rowData = e.component.getVisibleRows().find(row => row.rowType === 'data' && row.key === e.key);

    e.cancel = rowData && this.isMasterDetailExpandable && !this.isMasterDetailExpandable({ data: rowData.data });
  }

  public customizeColumnsDisableHidingPriority(columns: Array<any>) {
    
  }
}
