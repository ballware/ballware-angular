import {
  Column as TreeListColumn,
  ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData
} from 'devextreme/ui/tree_list';
import {
  Column as DataGridColumn,
  ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData
} from 'devextreme/ui/data_grid';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  AutocompleteCreator,
  EDIT_SERVICE,
  EditService,
  LOOKUP_SERVICE,
  LookupCreator,
  LookupDescriptor,
  LookupService,
  PickvalueCreator,
  Translator,
  TRANSLATOR,
} from '@ballware/meta-services';
import {
  createLookupDelegateBuilder,
  LOOKUP_DELEGATE_BUILDER_FACTORY,
  LookupDelegateBuilderFactory,
} from '../../utils';
import { get } from 'lodash';
import { RequiredRule } from 'devextreme/common';
import {
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
} from '@angular/core';
import { one } from 'devextreme/events';
import {
  COLUMN_EDITOR_CELL,
  COLUMN_EDITOR_DELEGATE,
  COLUMN_LOOKUP_PARAMS,
  ColumnEditCellTemplateData,
  DETAIL_COLUMN_DATAMEMBER,
  DetailCollectionEditing,
  DetailColumnEditorDelegateService,
  EntityColumnEditorDelegateService,
} from '../../directives';
import { ColumnMultiLookupComponent } from './columnitem/columnmultilookup.component';

export const createDetailMultilookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  dataMember: string|undefined,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {
  const t = inject(TRANSLATOR);
  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

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
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const editorInjector = Injector.create({
        parent: injector,
        providers: [
          {
            provide: DETAIL_COLUMN_DATAMEMBER,
            useValue: dataMember
          },
          {
            provide: COLUMN_LOOKUP_PARAMS,
            useValue: lookupParams
          },
          {
            provide: COLUMN_EDITOR_CELL,
            useValue: cellInfo
          },
          {
            provide: COLUMN_EDITOR_DELEGATE,
            useFactory: (t: Translator, lookupService: LookupService, editService: EditService, lookupFactory: LookupDelegateBuilderFactory, dataMember: string, lookupParams: Record<string, unknown>, cell: ColumnEditCellTemplateData, editing: DetailCollectionEditing, destroyRef: DestroyRef) => new DetailColumnEditorDelegateService(t, lookupService, editService, lookupFactory, dataMember, lookupParams, cell, editing, destroyRef),
            deps: [TRANSLATOR, LOOKUP_SERVICE, EDIT_SERVICE, LOOKUP_DELEGATE_BUILDER_FACTORY, DETAIL_COLUMN_DATAMEMBER, COLUMN_LOOKUP_PARAMS, COLUMN_EDITOR_CELL, DetailCollectionEditing, DestroyRef]
          }
        ]
      });

      const compRef = createComponent(ColumnMultiLookupComponent, {
        environmentInjector: envInjector,
        elementInjector: editorInjector
      });

      cellElement.appendChild(compRef.location.nativeElement);

      compRef.changeDetectorRef.detectChanges();

      one(cellElement, 'dxremove', () => {
        compRef.destroy();
      });
    },
    showEditorAlways: true,
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
    }
  } as ColumnType;
}


export const createEntityMultilookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
  c: GridLayoutColumn,
  dataMember: string|undefined,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => {
  const t = inject(TRANSLATOR);
  const injector = inject(Injector);
  const envInjector = inject(EnvironmentInjector);

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
    editorOptions: c,
    editCellTemplate: (cellElement: HTMLElement, cellInfo: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData) => {
      cellElement.innerHTML = '';

      const editorInjector = Injector.create({
        parent: injector,
        providers: [
          {
            provide: COLUMN_LOOKUP_PARAMS,
            useValue: lookupParams
          },
          {
            provide: COLUMN_EDITOR_CELL,
            useValue: cellInfo
          },
          {
            provide: COLUMN_EDITOR_DELEGATE,
            useClass: EntityColumnEditorDelegateService
          }
        ]
      });

      const compRef = createComponent(ColumnMultiLookupComponent, {
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
    }
  } as ColumnType;
}
