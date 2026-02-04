import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import { createDefaultColumn } from '../utils';

export const createBoolColumn = <
  ColumnType extends TreeListColumn | DataGridColumn
>(c: GridLayoutColumn) => {

  return {
    ...createDefaultColumn(c),
    dataType: 'boolean',
  } as ColumnType;
};
