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
import { one } from 'devextreme/events';
import { ColumnPopupComponent  } from './columnitem/columnpopup.component';
import { createDefaultColumn } from '../utils';
import {
  CRUD_SERVICE, CrudService,
  EDIT_SERVICE,
  EditService,
  LOOKUP_SERVICE, LookupElementType,
  LookupService,
  TRANSLATOR,
  Translator,
} from '@ballware/meta-services';
import { LOOKUP_DELEGATE_BUILDER_FACTORY, LookupDelegateBuilderFactory } from '../../utils';
import {
  COLUMN_EDITOR_CELL,
  COLUMN_EDITOR_DELEGATE,
  COLUMN_LOOKUP_PARAMS,
  DETAIL_COLUMN_DATAMEMBER,
  DetailColumnEditorDelegateService,
  EntityColumnEditorDelegateService,
} from '../../services';
import {
  ColumnEditCellTemplateData,
  DetailCollectionEditing,
} from '../../directives';

export const createDetailPopupColumn = <
  ColumnType extends TreeListColumn | DataGridColumn
>(
  c: GridLayoutColumn,
  dataMember: string,
  lookups: Record<string, LookupElementType>,
  lookupParams: Record<string, unknown>
) => {
  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    ...createDefaultColumn(c),
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
              lookupService: LookupService,
              crudService: CrudService,
              editService: EditService,
              lookupFactory: LookupDelegateBuilderFactory,
              dataMember: string,
              lookupParams: Record<string, unknown>,
              cell: ColumnEditCellTemplateData,
              editing: DetailCollectionEditing,
              destroyRef: DestroyRef
            ) =>
              new DetailColumnEditorDelegateService(
                t,
                lookupService,
                crudService,
                editService,
                lookupFactory,
                dataMember,
                lookupParams,
                cell,
                editing,
                destroyRef
              ),
            deps: [
              TRANSLATOR,
              LOOKUP_SERVICE,
              CRUD_SERVICE,
              EDIT_SERVICE,
              LOOKUP_DELEGATE_BUILDER_FACTORY,
              DETAIL_COLUMN_DATAMEMBER,
              COLUMN_LOOKUP_PARAMS,
              COLUMN_EDITOR_CELL,
              DetailCollectionEditing,
              DestroyRef,
            ],
          },
        ],
      });

      const compRef = createComponent(ColumnPopupComponent, {
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

export const createEntityPopupColumn = <
  ColumnType extends TreeListColumn | DataGridColumn
>(
  c: GridLayoutColumn,
  lookups: Record<string, LookupElementType>,
  lookupParams: Record<string, unknown>
) => {
  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

  return {
    ...createDefaultColumn(c),
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

      const compRef = createComponent(ColumnPopupComponent, {
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

