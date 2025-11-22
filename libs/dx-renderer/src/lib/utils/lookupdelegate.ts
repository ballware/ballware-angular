import { Observable } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { CustomItemCreatingEvent as SelectBoxCustomItemCreatingEvent } from 'devextreme/ui/select_box';
import { CustomItemCreatingEvent as TagBoxCustomItemCreatingEvent } from 'devextreme/ui/tag_box';

export interface LookupDelegate {
  grouped$: Observable<boolean>;
  dataSource$: Observable<DataSource|undefined>;
  displayExpr$: Observable<string|undefined>;
  valueExpr$: Observable<string|undefined>;
  hasLookupItemHint$: Observable<boolean>;
  acceptCustomValue$: Observable<boolean>;

  dataSource: DataSource|undefined;
  displayExpr: string|undefined;
  valueExpr: string|undefined;
  acceptCustomValue: boolean;

  getLookupItemKeyValue(item: Record<string, unknown>): string|undefined;
  getLookupItemDisplayValue(item: Record<string, unknown>): string|undefined;
  getLookupItemHintValue(item: Record<string, unknown>): string|undefined;

  onCustomItemCreating(event: SelectBoxCustomItemCreatingEvent | TagBoxCustomItemCreatingEvent): void;

  setLookupItems(items: Array<any>): void;
  setAcceptCustomValue(accept: boolean): void;
}
