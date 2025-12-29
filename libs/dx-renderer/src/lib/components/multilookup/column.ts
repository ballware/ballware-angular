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
  LookupCreator,
  LookupDescriptor,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { createLookupDelegateBuilder } from '../../utils';
import { get } from 'lodash';
import { RequiredRule } from 'devextreme/common';
import { createComponent, EnvironmentInjector, inject, Injector } from '@angular/core';
import { one } from 'devextreme/events';
import { DetailColumnMultilookupComponent } from './detailcolumn/detailcolumnmultilookup.component';

export const createMultilookupColumn = <ColumnType extends TreeListColumn | DataGridColumn>(
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

      const compRef = createComponent(DetailColumnMultilookupComponent, {
        environmentInjector: envInjector,
        elementInjector: injector
      });

      cellElement.appendChild(compRef.location.nativeElement);

      compRef.instance.cell = cellInfo;
      compRef.instance.dataMember = cellInfo.column.editorOptions.dataMember;
      compRef.instance.item = cellInfo.data;

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
