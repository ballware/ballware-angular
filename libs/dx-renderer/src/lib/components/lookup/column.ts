import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  NOTIFICATION_SERVICE,
  PickvalueCreator,
} from '@ballware/meta-services';
import { inject } from '@angular/core';
import { createColumnLookupDelegate, createDefaultColumn } from '../utils';

export const createDetailLookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  dataMember: string|undefined,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {

  const notificationService = inject(NOTIFICATION_SERVICE);

  const lookupDelegate = createColumnLookupDelegate(c, lookups, lookupParams, notificationService);

  return {
    ...createDefaultColumn(c, lookupDelegate),
    editorOptions: {
      showClearButton: true,
    }
  } as ColumnType;
}

export const createEntityLookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {

  const notificationService = inject(NOTIFICATION_SERVICE);

  const lookupDelegate = createColumnLookupDelegate(
    c,
    lookups,
    lookupParams,
    notificationService
  );

  return {
    ...createDefaultColumn(c, lookupDelegate),
    editorOptions: {
      showClearButton: true,
    }
  } as ColumnType;
}

