import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { dxElement } from 'devextreme/core/element';
import DataSource from 'devextreme/data/data_source';
import { dxEvent } from 'devextreme/events';
import { dxDataGridColumn } from 'devextreme/ui/data_grid';
import { dxToolbarItem, dxToolbarOptions } from 'devextreme/ui/toolbar';
import { MetaService } from '@ballware/meta-services';
import { CrudItem, EntityCustomFunction, GridLayout } from '@ballware/meta-model';
import { combineLatest, takeUntil } from 'rxjs';
import { I18NextPipe } from 'angular-i18next';
import { WithDestroy } from '../../../utils/withdestroy';

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
  @Input() summary: Record<string, unknown>|undefined;
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
  @Output() customFunctionClick = new EventEmitter<{ items: Array<CrudItem>, target: Element, id: string }>();
  @Output() rowDblClick = new EventEmitter<{
      event: dxEvent;
      data: CrudItem;
      element: dxElement;
    }>();
  @Input() isMasterDetailExpandable?: (e: {
      data: CrudItem
    }) => boolean;

  private displayName?: string;

  public selectedRowKeys: string[] = [];
  public selectedRowData: CrudItem[] = [];

  public initialized = false;

  constructor(private metaService: MetaService,
    private i18next: I18NextPipe) {
    super();
  }

  ngOnInit(): void {
    combineLatest([this.metaService.displayName$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([displayName]) => {
        if (displayName) {
          this.displayName = displayName;
          this.initialized = true;
        }
      });
  }

  public get style(): string {
    return `height: ${this.height ?? '100%'}`;
  }

  public editingStart() {
    console.log('editingStart');
  }

  public gridEditorPreparing() {
    console.log('gridEditorPreparing');
  }

  public selectionChanged(e: { selectedRowKeys: string[], selectedRowsData: CrudItem[]}) {
    this.selectedRowKeys = e.selectedRowKeys as string[];
    this.selectedRowData = e.selectedRowsData as CrudItem[];
  }

  public toolbarPreparing(e: { toolbarOptions?: dxToolbarOptions }) {

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
              id: f.id,
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

  public rowExpanding() {
    console.log('rowExpanding');
  }

  public customizeColumnsDisableHidingPriority(columns: Array<any>) {
    console.log('customizeColumnsDisableHidingPriority');
  }
}
