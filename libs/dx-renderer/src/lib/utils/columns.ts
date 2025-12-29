import { CrudItem, GridLayoutColumn } from "@ballware/meta-model";
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor, LookupElementType,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { AsyncRule } from 'devextreme-angular/common';
import { ValidationCallbackData } from 'devextreme/common';
import { Column as DataGridColumn, ColumnButton as DataGridColumnButton } from 'devextreme/ui/data_grid';
import { Column as TreeListColumn, ColumnButton as TreeListColumnButton } from "devextreme/ui/tree_list";
import { cloneDeep } from "lodash";
import { firstValueFrom, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { COLUMNCONFIGURATION_REGISTRY } from '../registries';

type ButtonClickEvent = {
  row?: { data: CrudItem; node?: { data: CrudItem } };
  event?: { currentTarget?: EventTarget }
};

type ButtonVisibleOptions = {
  row?: { data: CrudItem; node?: { data: CrudItem } }
};

export type OptionButtons =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'print'
  | 'options'
  | 'customoptions';

const columnPositionComparer = (a: GridLayoutColumn, b: GridLayoutColumn) => {
  if ((a.position ?? 0) < (b.position ?? 0)) {
    return -1;
  }

  if ((a.position ?? 0) > (b.position ?? 0)) {
    return 1;
  }

  return 0;
}

function createColumn<ColumnType extends TreeListColumn | DataGridColumn>(
    mode: 'entity' | 'detail',
    c: GridLayoutColumn,
    dataMember: string|undefined,
    editMode: 'row' | 'instant',
    lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
    lookupParams: Record<string, unknown>
  ) {

  const columnConfigurationRegistry = inject(COLUMNCONFIGURATION_REGISTRY);

  let type = c.type;

  if (editMode === 'instant' && c.editable && type !== 'popup') {
    type = 'dynamic';
  }

  return mode === 'detail' && dataMember
    ? columnConfigurationRegistry.resolveDetailColumnConfiguration<ColumnType>(type, c, dataMember, lookups, lookupParams)
    : columnConfigurationRegistry.resolveEntityColumnConfiguration<ColumnType>(type, c, lookups, lookupParams);
}

export const createColumnConfigurationForEntity = <ColumnType extends TreeListColumn | DataGridColumn>(
  columns: Array<GridLayoutColumn>,
  lookups: Record<string, LookupElementType>,
  lookupParams: Record<string, unknown>,
  mode: 'small' | 'medium' | 'large',
  editMode: 'row' | 'instant',
  onButtonClick: (
    button: OptionButtons,
    data: CrudItem,
    target: Element
  ) => void,
  onButtonAllowed: (button: OptionButtons, data: CrudItem) => boolean
) => {
  const t = inject(TRANSLATOR);

  const gridColumns =
    cloneDeep(columns ?? [])
      .sort(columnPositionComparer)
      .map(c => createColumn<ColumnType>('entity', c, undefined, editMode, lookups, lookupParams)) ?? [];

  switch (mode) {
    case 'small':
    case 'medium':
      gridColumns.push({
        type: 'buttons',
        width: '40px',
        buttons: [
          {
            hint: t('datacontainer.actions.options'),
            icon: 'bi bi-three-dots-vertical',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'options',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'options',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton
        ],
      } as ColumnType);
      break;
    case 'large':
      gridColumns.push({
        type: 'buttons',
        buttons: [
          {
            hint: t('datacontainer.actions.show'),
            icon: 'bi bi-eye-fill',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'view',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'view',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton,
          {
            hint: t('datacontainer.actions.edit'),
            icon: 'bi bi-pencil-fill',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'edit',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'edit',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton,
          {
            hint: t('datacontainer.actions.remove'),
            icon: 'bi bi-trash-fill',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'delete',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'delete',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton,
          {
            hint: t('datacontainer.actions.print'),
            icon: 'bi bi-printer-fill',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'print',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'print',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton,
          {
            hint: t('datacontainer.actions.options'),
            icon: 'bi bi-three-dots-vertical',
            onClick: (e: ButtonClickEvent) =>
              onButtonClick(
                'customoptions',
                e.row?.data ?? e.row?.node?.data as CrudItem,
                e.event?.currentTarget as Element
              ),
            visible: (options: ButtonVisibleOptions) =>
              onButtonAllowed(
                'customoptions',
                options.row?.data ?? options.row?.node?.data as CrudItem
              ),
          } as DataGridColumnButton | TreeListColumnButton,
        ],
      } as ColumnType);
      break;
  }

  return gridColumns;
}

export const createColumnConfigurationForDetail = <ColumnType extends TreeListColumn | DataGridColumn>(
  columns: Array<GridLayoutColumn>,
  dataMember: string,
  lookups: Record<string, LookupElementType>,
  lookupParams: Record<string, unknown>,
  editMode: 'row' | 'instant',
  onRowValidating: (e: ValidationCallbackData) => Observable<string|undefined>
) => {

  const gridColumns =
    cloneDeep(columns ?? [])
      .sort(columnPositionComparer)
      .map(c => createColumn<ColumnType>('detail', c, dataMember, editMode, lookups, lookupParams)) ?? [];

  gridColumns.push({
    visible: false,
    validationRules: [
      {
        type: 'async',
        validationCallback: async (e) => {
          const message = await firstValueFrom(onRowValidating(e));

          if (message) {
            e.rule.message = message;
            return false;
          }

          return true;
        }
      } as AsyncRule
    ]
  } as ColumnType);

  return gridColumns;
}
