import {
  Column as TreeListColumn,
  ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData
} from 'devextreme/ui/tree_list';
import {
  Column as DataGridColumn,
  ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData
} from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import { createComponent, DestroyRef, EnvironmentInjector, inject, Injector } from '@angular/core';
import {
  CRUD_SERVICE,
  CrudService,
  EDIT_SERVICE,
  EditService,
  LOOKUP_SERVICE,
  LookupByIdentifierFunc,
  LookupElementType,
  LookupService,
  NOTIFICATION_SERVICE,
  NotificationService,
  TRANSLATOR,
  Translator,
} from '@ballware/meta-services';

import { one } from 'devextreme/events';

import { DynamicColumnComponent } from './columnitem/dynamiccolumn.component';
import {
  COLUMN_EDITOR_CELL,
  COLUMN_EDITOR_DELEGATE,
  COLUMN_LOOKUP_PARAMS,
  ColumnEditCellTemplateData,
  DETAIL_COLUMN_DATAMEMBER,
  DetailColumnEditorDelegateService,
  EntityColumnEditorDelegateService,
} from '../../services';
import { DetailCollectionEditing } from '../../directives';

export const createDetailDynamicColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  dataMember: string,
  lookups: Record<string, LookupElementType>,
  getLookupByIdentifier: LookupByIdentifierFunc,
  lookupParams: Record<string, unknown>
) => {

  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const editorInjector = Injector.create({
        parent: injector,
        providers: [
          {
            provide: DETAIL_COLUMN_DATAMEMBER,
            useValue: dataMember,
          },
          {
            provide: COLUMN_LOOKUP_PARAMS,
            useValue: lookupParams,
          },
          {
            provide: COLUMN_EDITOR_CELL,
            useValue: cellInfo,
          },
          {
            provide: COLUMN_EDITOR_DELEGATE,
            useFactory: (
              t: Translator,
              notificationService: NotificationService,
              lookupService: LookupService,
              crudService: CrudService,
              editService: EditService,
              dataMember: string,
              lookupParams: Record<string, unknown>,
              cell: ColumnEditCellTemplateData,
              editing: DetailCollectionEditing,
              destroyRef: DestroyRef
            ) =>
              new DetailColumnEditorDelegateService(
                t,
                notificationService,
                lookupService,
                crudService,
                editService,
                dataMember,
                lookupParams,
                cell,
                editing,
                destroyRef
              ),
            deps: [
              TRANSLATOR,
              NOTIFICATION_SERVICE,
              LOOKUP_SERVICE,
              CRUD_SERVICE,
              EDIT_SERVICE,
              DETAIL_COLUMN_DATAMEMBER,
              COLUMN_LOOKUP_PARAMS,
              COLUMN_EDITOR_CELL,
              DetailCollectionEditing,
              DestroyRef,
            ],
          },
        ],
      });

      const compRef = createComponent(DynamicColumnComponent, {
        environmentInjector: envInjector,
        elementInjector: editorInjector,
      });

      cellElement.appendChild(compRef.location.nativeElement);
      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true
  } as ColumnType;
}

export const createEntityDynamicColumn = <
  ColumnType extends TreeListColumn | DataGridColumn
>(
  c: GridLayoutColumn,
  lookups: Record<
    string,
    LookupElementType
  >,
  getLookupByIdentifier: LookupByIdentifierFunc,
  lookupParams: Record<string, unknown>
) => {
  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    dataField: c.dataMember,
    caption: c.caption,
    width: c.width,
    fixed: !!c.fixedPosition,
    fixedPosition: c.fixedPosition,
    visible: c.visible ?? true,
    sortOrder: c.sorting,
    editorOptions: c,
    editCellTemplate: (
      cellElement: HTMLElement,
      cellInfo:
        | DataGridColumnEditCellTemplateData
        | TreeListColumnEditCellTemplateData
    ) => {
      cellElement.innerHTML = '';

      const editorInjector = Injector.create({
        parent: injector,
        providers: [
          {
            provide: COLUMN_LOOKUP_PARAMS,
            useValue: lookupParams,
          },
          {
            provide: COLUMN_EDITOR_CELL,
            useValue: cellInfo,
          },
          {
            provide: COLUMN_EDITOR_DELEGATE,
            useClass: EntityColumnEditorDelegateService,
          },
        ],
      });

      const compRef = createComponent(DynamicColumnComponent, {
        environmentInjector: envInjector,
        elementInjector: editorInjector,
      });

      cellElement.appendChild(compRef.location.nativeElement);
      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true,
  } as ColumnType;
};
