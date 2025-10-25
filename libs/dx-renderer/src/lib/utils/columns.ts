import { CrudItem, GridLayoutColumn } from "@ballware/meta-model";
import { AutocompleteCreator, LookupCreator, LookupDescriptor, LookupStoreDescriptor, PickvalueCreator } from "@ballware/meta-services";
import { dxEvent } from "devextreme/events";
import { Column as DataGridColumn, ColumnCellTemplateData as DataGridColumnCellTemplateData } from "devextreme/ui/data_grid";
import { Column as TreeListColumn, ColumnCellTemplateData as TreeListColumnCellTemplateData } from "devextreme/ui/tree_list";
import { cloneDeep } from "lodash";
import { get } from "lodash";
import { createLookupDataSource } from "./datasource";
import { DxElement } from "devextreme/core/element";
import { firstValueFrom, Observable } from 'rxjs';
import { AsyncRule } from 'devextreme-angular/common';
import { ValidationCallbackData } from 'devextreme/common';

export type OptionButtons =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'print'
  | 'options'
  | 'customoptions';

  function createColumn<ColumnType extends TreeListColumn | DataGridColumn>(
    t: (id: string, param?: Record<string, unknown>) => string,
    c: GridLayoutColumn,
    editMode: 'row' | 'instant',
    lookups:
      | Record<
          string,
          LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>
        >
      | undefined,
    lookupParams: Record<string, unknown>
  ) {
    let type = c.type;

    if (editMode === 'instant' && c.editable && type != 'staticmultilookup' && type !== 'dynamic' && type !== 'popup') {
      type = 'dynamic';
    }

    switch (type) {
      case 'text':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
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
          fixed: !!c.fixedPosition,
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
        } as ColumnType;
      case 'date':
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
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
          fixed: !!c.fixedPosition,
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
              get(lookupParams, c.lookupParam) as string
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
          fixed: !!c.fixedPosition,
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
      case 'multilookup': {
        const lookup = (lookups && c.lookup && c.lookupParam
          ? (lookups[c.lookup] as LookupCreator)(
              get(lookupParams, c.lookupParam) as string
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
          fixed: !!c.fixedPosition,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          lookup: {
            dataSource: dataSource?.store(),
            displayExpr: lookup?.displayMember,
            valueExpr: lookup?.valueMember,
          },
          editorOptions: c,
          cellTemplate: editMode === 'instant' && c.editable ? 'staticedit' : (cellElement: DxElement, cellInfo: DataGridColumnCellTemplateData | TreeListColumnCellTemplateData) => {
            const noBreakSpace = '\u00A0';
            const cellLookup = cellInfo.column?.lookup;

            const displayValues = (cellInfo.value || []).map(
              (id: string) => (cellLookup && cellLookup.calculateCellValue) ? cellLookup.calculateCellValue(id) : id,
            );
            const text = displayValues.join(', ');

            cellElement.textContent = text || noBreakSpace;
            cellElement.title = text;
          },
          editCellTemplate: 'staticedit',
        } as ColumnType;
      }
      case 'staticlookup': {
        const items = c.items;

        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          lookup: {
            dataSource: items,
            displayExpr: c.displayExpr ?? 'Text',
            valueExpr: c.valueExpr ?? 'Value',
          }
        } as ColumnType;
      }
      case 'staticmultilookup': {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
          fixedPosition: c.fixedPosition,
          allowEditing: (editMode === 'row' && c.editable) ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          editorOptions: c,
          cellTemplate: editMode === 'instant' && c.editable ? 'staticedit' : 'static',
          editCellTemplate: 'staticedit',
        } as ColumnType;
      }
      case 'dynamic': {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
          fixedPosition: c.fixedPosition,
          allowEditing: (editMode === 'row' && c.editable) ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
          editorOptions: c,
          cellTemplate: editMode === 'instant' && !c.editable ? 'dynamic' : null,
          editCellTemplate: 'dynamicedit',
          showEditorAlways: editMode === 'instant' && c.editable
        } as ColumnType;
      }
      case 'popup': {
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
          cellTemplate: 'dynamic',
        } as ColumnType;
      }
      default: {
        return {
          dataField: c.dataMember,
          caption: c.caption,
          width: c.width,
          fixed: !!c.fixedPosition,
          fixedPosition: c.fixedPosition,
          allowEditing: c.editable ?? false,
          visible: c.visible ?? true,
          sortOrder: c.sorting,
        } as ColumnType;
      }
    }
  }

export function createColumnConfiguration<
  ColumnType extends TreeListColumn | DataGridColumn
>(
  t: (id: string, param?: Record<string, unknown>) => string,
  columns: Array<GridLayoutColumn>,
  lookups:
    | Record<
        string,
        LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>
      >
    | undefined,
  lookupParams: Record<string, unknown>,
  mode: 'small' | 'medium' | 'large' | 'detail',
  editMode: 'row' | 'instant',
  onButtonClick?: (
    button: OptionButtons,
    data: CrudItem,
    target: Element
  ) => void,
  onButtonAllowed?: (button: OptionButtons, data: CrudItem) => boolean,
  onRowValidating?: (e: ValidationCallbackData) => Observable<string|undefined>
): Array<ColumnType> {
  const gridColumns =
    cloneDeep(columns ?? [])
      .sort((a, b) => ((a.position ?? 0) < (b.position ?? 0) ? -1 : (a.position ?? 0) > (b.position ?? 0) ? 1 : 0))
      .map(c => createColumn<ColumnType>(t, c, editMode, lookups, lookupParams)) ?? [];

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
    case 'detail':
      {
        if (onRowValidating) {
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
          } as ColumnType)
        }
      }
      break;
  }

  return gridColumns;
}
