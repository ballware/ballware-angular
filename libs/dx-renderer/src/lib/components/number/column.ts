import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import { RequiredRule } from 'devextreme/common';

export const createNumberColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  t: (id: string, param?: Record<string, unknown>) => string
) => {

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    allowEditing: c.editable ?? false,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    dataType: 'number',
    format: c.precision
      ? { type: 'fixedPoint', precision: c.precision }
      : null,
    editorOptions: { showSpinButtons: true },
    validationRules: c.required ? [
      {
        type: 'required',
        message: t('validation.messages.required', { label: c.caption })
      } as RequiredRule
    ] : [],
  } as ColumnType;
}
