import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { createLookupDelegateBuilder } from '../../utils';
import { get } from 'lodash';
import { RequiredRule } from 'devextreme/common';
import { inject } from '@angular/core';

export const createLookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {

  const t  = inject(TRANSLATOR);

  const lookupDelegateBuilder = createLookupDelegateBuilder(lookups);

  if (c.lookup) {
    lookupDelegateBuilder.forIdentifier(c.lookup);
  }

  if (c.lookupParam) {
    lookupDelegateBuilder.withParamFromMember(c.lookupParam, (member) => get(lookupParams, member) as string);
  }

  const lookup = lookupDelegateBuilder.build();

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    allowEditing: c.editable ?? false,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: {
      showClearButton: true,
    },
    validationRules: c.required ? [
      {
        type: 'required',
        message: t('validation.messages.required', { label: c.caption })
      } as RequiredRule
    ] : [],
    lookup: {
      dataSource: lookup.dataSource?.store(),
      displayExpr: lookup?.displayExpr,
      valueExpr: lookup?.valueExpr,
    },
  } as ColumnType;
}

