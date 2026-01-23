import { GridLayoutColumn } from '@ballware/meta-model';
import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { LookupDelegate } from '../../utils';
import { RequiredRule } from 'devextreme/common';
import { TRANSLATOR } from '@ballware/meta-services';
import { inject } from '@angular/core';

export const createDefaultColumn = <ColumnType extends TreeListColumn | DataGridColumn>(c: GridLayoutColumn, lookupDelegate?: LookupDelegate) => {
  const t = inject(TRANSLATOR);

  const column = {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    allowEditing: c.editable ?? false,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    validationRules: c.required
      ? [
          {
            type: 'required',
            message: t('validation.messages.required', { label: c.caption }),
          } as RequiredRule,
        ]
      : []
  } as ColumnType;

  if (lookupDelegate) {
    column.lookup = {
      dataSource: lookupDelegate.dataSource?.store(),
      displayExpr: lookupDelegate?.displayExpr,
      valueExpr: lookupDelegate?.valueExpr,
    };
  }

  return column;
}
