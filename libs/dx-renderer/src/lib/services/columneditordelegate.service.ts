import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EditItemRef } from '@ballware/meta-services';
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';
import { LookupDelegate } from '../utils';
import { ValidationRule } from 'devextreme/common';
import { GridLayoutColumn } from '@ballware/meta-model';

export interface ColumnEditorDelegateService {
  prepared$: Observable<boolean>;
  preparedColumn$: Observable<GridLayoutColumn|undefined>;
  lookup$: Observable<LookupDelegate|undefined>;

  readonly$: Observable<boolean|undefined>;

  value$: Observable<unknown>;
  valueChanged$: Observable<((editor: EditItemRef, value: unknown) => void)|undefined>;

  validationRules$: Observable<Array<ValidationRule>>|undefined;
}

export type ColumnEditCellTemplateData = DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;

export const COLUMN_EDITOR_CELL = new InjectionToken<ColumnEditCellTemplateData>('Column editor cell');
export const COLUMN_LOOKUP_PARAMS = new InjectionToken<Record<string, unknown>>('Column lookup params');
export const COLUMN_EDITOR_DELEGATE = new InjectionToken<ColumnEditorDelegateService>("Generic column editor delegate");
