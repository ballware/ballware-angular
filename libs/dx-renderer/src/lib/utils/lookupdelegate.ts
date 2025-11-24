import { Observable } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { CustomItemCreatingEvent as SelectBoxCustomItemCreatingEvent } from 'devextreme/ui/select_box';
import { CustomItemCreatingEvent as TagBoxCustomItemCreatingEvent } from 'devextreme/ui/tag_box';
import { AutocompleteCreator, LookupCreator, LookupDescriptor, PickvalueCreator } from '@ballware/meta-services';
import { ApiError } from '@ballware/meta-api';
import { InjectionToken } from '@angular/core';

export interface LookupDelegate {
  grouped$: Observable<boolean>;
  dataSource$: Observable<DataSource|undefined>;
  displayExpr$: Observable<string|undefined>;
  valueExpr$: Observable<string|undefined>;
  hasLookupItemHint$: Observable<boolean>;
  lookupItems$: Observable<Array<any>|undefined>;
  acceptCustomValue$: Observable<boolean>;

  dataSource: DataSource|undefined;
  displayExpr: string|undefined;
  valueExpr: string|undefined;
  lookupItems: Array<any>|undefined;
  acceptCustomValue: boolean;

  getLookupItemKeyValue(item: Record<string, unknown>): string|undefined;
  getLookupItemDisplayValue(item: Record<string, unknown>): string|undefined;
  getLookupItemHintValue(item: Record<string, unknown>): string|undefined;

  onCustomItemCreating(event: SelectBoxCustomItemCreatingEvent | TagBoxCustomItemCreatingEvent): void;

  setLookupItems(items: Array<any>): void;
  setAcceptCustomValue(accept: boolean): void;
}

export interface LookupDelegateBuilder {
  forIdentifier(lookupIdentifier: string): LookupDelegateBuilder;
  forStaticItems(items: Array<Record<string, unknown>>): LookupDelegateBuilder;
  forItemsFromMember(dataMember: string, getDelegate: (dataMember: string) => Array<Record<string, unknown>>): LookupDelegateBuilder;
  withUnknownLookupFallback(fallback: (identifier: string) => LookupDescriptor): LookupDelegateBuilder;
  withDisplayExpr(displayExpr: string|undefined): LookupDelegateBuilder;
  withValueExpr(valueExpr: string|undefined): LookupDelegateBuilder;
  withHintExpr(hintExpr: string|undefined): LookupDelegateBuilder;
  withParamFromMember(dataMember: string, getDelegate: (dataMember: string) => string|string[]): LookupDelegateBuilder;
  withPickvaluesForEntityAndField(entity: string, field: string): LookupDelegateBuilder;
  withGroupBy(groupBy: string|undefined): LookupDelegateBuilder;
  withAcceptCustomValue(accept: boolean|undefined): LookupDelegateBuilder;
  withApiErrorHandler(handler: (error: ApiError) => void): LookupDelegateBuilder;
  build(): LookupDelegate;
}

export type LookupDelegateBuilderFactory = (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => LookupDelegateBuilder;

export const LOOKUP_DELEGATE_BUILDER_FACTORY = new InjectionToken<LookupDelegateBuilderFactory>('Lookup delegate builder factory');
