import { CrudItem, GridLayoutColumn } from "@ballware/meta-model";
import { AutocompleteCreator, LookupCreator, LookupDescriptor, LookupStoreDescriptor } from "@ballware/meta-services";
import { dxEvent } from "devextreme/events";
import { dxDataGridColumn } from "devextreme/ui/data_grid";
import { dxTreeListColumn } from "devextreme/ui/tree_list";
import { cloneDeep } from "lodash";
import { getByPath } from "./databinding";
import { createLookupDataSource } from "./datasource";

export type OptionButtons =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'print'
  | 'options'
  | 'customoptions';

  function createColumn<ColumnType extends dxTreeListColumn | dxDataGridColumn>(
    t: (id: string, param?: Record<string, unknown>) => string,
    c: GridLayoutColumn,
    lookups:
      | Record<
          string,
          LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
        >
      | undefined,
    lookupParams: Record<string, unknown>
  ) {
    switch (c.type) {
      case 'text':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
        } as ColumnType;
      case 'bool':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          dataType: 'boolean',
        } as ColumnType;
      case 'number':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          format: c.precision
            ? { type: 'fixedPoint', precision: c.precision }
            : null,
          editorOptions: { showSpinButtons: true },
        } as ColumnType;
      case 'date':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          dataType: 'date',
          format: t('format.date'),
        } as ColumnType;
      case 'datetime':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          dataType: 'datetime',
          format: t('format.datetime'),
        } as ColumnType;
      case 'lookup':
      case 'pickvalue': {
        const lookup = (lookups && c.lookup && c.lookupParam
          ? (lookups[c.lookup] as LookupCreator)(
              getByPath(lookupParams, c.lookupParam) as string
            )
          : lookups && c.lookup
          ? lookups[c.lookup]
          : undefined) as LookupDescriptor;

        const dataSource = lookup
          ? createLookupDataSource(
              (lookup.store as LookupStoreDescriptor).listFunc,
              (lookup.store as LookupStoreDescriptor).byIdFunc
            )
          : undefined;

        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          lookup: {
            dataSource: dataSource?.store(),
            displayExpr: lookup?.displayMember,
            valueExpr: lookup?.valueMember,
          },
        } as ColumnType;
      }
      case 'staticlookup': {
        const items = c.items;

        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          lookup: {
            dataSource: items,
            displayExpr: c.displayExpr ?? 'Text',
            valueExpr: c.valueExpr ?? 'Value',
          },
        } as ColumnType;
      }
      case 'staticmultilookup': {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          editorOptions: c,
          cellTemplate: 'static',
          editCellTemplate: 'staticedit',
        } as ColumnType;
      }
      case 'dynamic': {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          editorOptions: c,
          cellTemplate: 'dynamic',
          editCellTemplate: 'dynamicedit',
        } as ColumnType;
      }
      case 'popup': {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          editorOptions: c,
          cellTemplate: 'dynamic',
        } as ColumnType;
      }
      default: {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: c.fixedPosition ? true : false,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
        } as ColumnType;
      }
    }
  }

export function createColumnConfiguration<
  ColumnType extends dxTreeListColumn | dxDataGridColumn
>(
  t: (id: string, param?: Record<string, unknown>) => string,
  columns: Array<GridLayoutColumn>,
  lookups:
    | Record<
        string,
        LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
      >
    | undefined,
  lookupParams: Record<string, unknown>,
  mode: 'small' | 'medium' | 'large' | 'detail',
  onButtonClick?: (
    button: OptionButtons,
    data: CrudItem,
    target: Element
  ) => void,
  onButtonAllowed?: (button: OptionButtons, data: CrudItem) => boolean
): Array<ColumnType> {
  const gridColumns =
    cloneDeep(columns ?? [])
      .sort((a, b) => ((a.position ?? 0) < (b.position ?? 0) ? -1 : (a.position ?? 0) > (b.position ?? 0) ? 1 : 0))
      .map(c => createColumn<ColumnType>(t, c, lookups, lookupParams)) ?? [];

  switch (mode) {
    case 'small':
    case 'medium':
      if (onButtonClick && onButtonAllowed) {
        gridColumns.push({
          type: 'buttons',
          width: '40px',
          buttons: [
            {
              hint: t('datacontainer.actions.options'),
              icon: 'bi bi-three-dots-vertical',
              onClick: (e: any) =>
                onButtonClick(
                  'options',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'options',
                  options.row.data ?? options.row.node.data
                ),
            },
          ],
        } as ColumnType);
      }
      break;
    case 'large':
      if (onButtonClick && onButtonAllowed) {
        gridColumns.push({
          type: 'buttons',
          buttons: [
            {
              hint: t('datacontainer.actions.show'),
              icon: 'bi bi-eye-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'view',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'view',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.edit'),
              icon: 'bi bi-pencil-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'edit',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'edit',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.remove'),
              icon: 'bi bi-trash-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'delete',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'delete',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.print'),
              icon: 'bi bi-printer-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'print',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'print',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.options'),
              icon: 'bi bi-three-dots-vertical',
              onClick: (e: any) =>
                onButtonClick(
                  'customoptions',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'customoptions',
                  options.row.data ?? options.row.node.data
                ),
            },
          ],
        } as ColumnType);
      }
      break;
  }

  return gridColumns;
}
