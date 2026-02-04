import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';

export const createButtonColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn
) => {

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    allowEditing: c.editable ?? false,
    visible: c.visible ?? true,
    cellTemplate: 'button',
    editCellTemplate: 'editbutton'
  } as ColumnType;
}
