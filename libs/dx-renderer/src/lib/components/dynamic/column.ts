import {
  Column as TreeListColumn,
  ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData
} from 'devextreme/ui/tree_list';
import {
  Column as DataGridColumn,
  ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData
} from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import { createComponent, EnvironmentInjector, inject, Injector } from '@angular/core';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  PickvalueCreator,
} from '@ballware/meta-services';

import { one } from 'devextreme/events';
import { DetailDynamicColumnComponent } from './detailcolumn/detaildynamiccolumn.component';
import { EntityDynamicColumnComponent } from './entitycolumn/entitydynamiccolumn.component';

export const createDetailDynamicColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  dataMember: string,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {

  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const compRef = createComponent(DetailDynamicColumnComponent, {
        environmentInjector: envInjector,
        elementInjector: injector
      });

      cellElement.appendChild(compRef.location.nativeElement);

      compRef.instance.dataMember = dataMember;
      compRef.instance.item = lookupParams;
      compRef.instance.cell = cellInfo;

      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true
  } as ColumnType;
}

export const createEntityDynamicColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {

  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const compRef = createComponent(EntityDynamicColumnComponent, {
        environmentInjector: envInjector,
        elementInjector: injector
      });

      cellElement.appendChild(compRef.location.nativeElement);

      compRef.instance.lookupParams = lookupParams;
      compRef.instance.dataMember = cellInfo.column.editorOptions.dataMember;
      compRef.instance.column = cellInfo.column.editorOptions as GridLayoutColumn;
      compRef.instance.item = cellInfo.data;

      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true
  } as ColumnType;
}
