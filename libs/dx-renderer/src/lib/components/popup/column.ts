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
import { one } from 'devextreme/events';
import { DetailColumnPopupComponent } from './detailcolumn/detailcolumnpopup.component';

export const createPopupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn
) => {

  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    allowEditing: false,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const compRef = createComponent(DetailColumnPopupComponent, {
        environmentInjector: envInjector,
        elementInjector: injector
      });

      cellElement.appendChild(compRef.location.nativeElement);

      compRef.instance.cell = cellInfo;
      compRef.instance.dataMember = cellInfo.column.editorOptions.dataMember;
      compRef.instance.item = cellInfo.data;

      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true
  } as ColumnType;
}
