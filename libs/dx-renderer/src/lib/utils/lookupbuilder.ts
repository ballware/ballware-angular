import { LookupDelegate } from './lookupdelegate';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor,
  LookupStoreDescriptor, PickvalueCreator
} from '@ballware/meta-services';
import { CustomItemCreatingEvent as SelectBoxCustomItemCreatingEvent } from 'devextreme/ui/select_box';
import { CustomItemCreatingEvent as TagBoxCustomItemCreatingEvent } from 'devextreme/ui/tag_box';
import { createArrayDatasource, createAutocompleteDataSource, createLookupDataSource } from './datasource';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { ApiError } from '@ballware/meta-api';
import { compileGetter, compileSetter } from 'devextreme/utils';
import DataSource from 'devextreme/data/data_source';

export interface LookupDelegateBuilder {
  forIdentifier(lookupIdentifier: string): LookupDelegateBuilder;
  forStaticItems(items: Array<Record<string, unknown>>): LookupDelegateBuilder;
  forItemsFromMember(dataMember: string, getDelegate: (dataMember: string) => Array<Record<string, unknown>>): LookupDelegateBuilder;
  withUnknownLookupFallback(fallback: (identifier: string) => LookupDescriptor): LookupDelegateBuilder;
  withDisplayExpr(displayExpr: string): LookupDelegateBuilder;
  withValueExpr(valueExpr: string): LookupDelegateBuilder;
  withHintExpr(hintExpr: string): LookupDelegateBuilder;
  withParamFromMember(dataMember: string, getDelegate: (dataMember: string) => string|string[]): LookupDelegateBuilder;
  withPickvaluesForEntityAndField(entity: string, field: string): LookupDelegateBuilder;
  withGroupBy(groupBy: string): LookupDelegateBuilder;
  withAcceptCustomValue(accept: boolean): LookupDelegateBuilder;
  withApiErrorHandler(handler: (error: ApiError) => void): LookupDelegateBuilder;
  build(): LookupDelegate;
}

const createDatasourceForRegularLookup = (lookupInstance: LookupDescriptor, groupBy: string|undefined, apiErrorHandler: ((error: ApiError) => void) | undefined) => {
  const { listFunc, byIdFunc } = (lookupInstance.store as LookupStoreDescriptor);

  return createLookupDataSource(
    () => listFunc()
      .pipe(catchError((error: ApiError) => {
        if (apiErrorHandler) {
          apiErrorHandler(error);
        }

        return of([]);
      })),
    (id) => byIdFunc(id)
      .pipe(catchError((error: ApiError) => {
        if (apiErrorHandler) {
          apiErrorHandler(error);
        }

        return of();
      })),
    {
      groupByProperty: groupBy
    }
  );
};

const createDatasourceForAutocompleteLookup = (lookupInstance: LookupDescriptor, apiErrorHandler: ((error: ApiError) => void) | undefined) => {
  const { listFunc } = (lookupInstance.store as LookupStoreDescriptor);

  return createAutocompleteDataSource(
    () => listFunc()
      .pipe(catchError((error: ApiError) => {
        if (apiErrorHandler) {
          apiErrorHandler(error);
        }

        return of([]);
      }))
  );
}

class LookupDelegateImpl implements LookupDelegate {

  private readonly _datasource$: BehaviorSubject<DataSource | undefined>;
  private readonly _acceptCustomValue$: BehaviorSubject<boolean>;
  private readonly _valueExpr$: Observable<string|undefined>;
  private readonly _displayExpr$: Observable<string|undefined>;
  private readonly _grouped$: Observable<boolean>;
  private readonly _hasLookupItemHint$: Observable<boolean>;
  private readonly _keyValueGetter: ((item: unknown) => unknown)|undefined;
  private readonly _displayValueGetter: ((item: unknown) => unknown)|undefined;
  private readonly _hintValueGetter: ((item: Record<string, unknown>) => unknown)|undefined;
  private readonly _keyValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined;
  private readonly _displayValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined;

  private _datasource: DataSource | undefined;
  private _valueExpr: string | undefined;
  private _displayExpr: string | undefined;
  private _acceptCustomValue: boolean = false;

  constructor(params: {
    datasource: DataSource | undefined,
    keyValueExpr: string | undefined,
    displayValueExpr: string | undefined,
    hintValueExpr: string | undefined,
    keyValueGetter: ((item: unknown) => unknown)|undefined,
    displayValueGetter: ((item: unknown) => unknown)|undefined,
    hintValueGetter: ((item: Record<string, unknown>) => unknown)|undefined,
    keyValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined,
    displayValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined,
    groupBy: string | undefined,
    acceptCustomValue: boolean
  }) {
    this._datasource$ = new BehaviorSubject(params.datasource);
    this._valueExpr$ = of(params.keyValueExpr);
    this._displayExpr$ = of(params.displayValueExpr);
    this._hasLookupItemHint$ = of(!!params.hintValueExpr);
    this._grouped$ = of(!!params.groupBy);
    this._acceptCustomValue$ = new BehaviorSubject(params.acceptCustomValue);
    this._keyValueGetter = params.keyValueGetter;
    this._displayValueGetter = params.displayValueGetter;
    this._hintValueGetter = params.hintValueGetter;
    this._keyValueSetter = params.keyValueSetter;
    this._displayValueSetter = params.displayValueSetter;

    this._datasource$.subscribe((value) => {
      this._datasource = value;
    });

    this._valueExpr$.subscribe((value) => {
      this._valueExpr = value;
    });

    this._displayExpr$.subscribe((value) => {
      this._displayExpr = value;
    });

    this._acceptCustomValue$.subscribe((value) => {
      this._acceptCustomValue = value;
    })
  }

  get dataSource(): DataSource | undefined {
    return this._datasource;
  }

  get valueExpr(): string | undefined {
    return this._valueExpr;
  }

  get displayExpr(): string | undefined {
    return this._displayExpr;
  }

  get acceptCustomValue(): boolean {
    return this._acceptCustomValue;
  }

  get acceptCustomValue$(): Observable<boolean> {
    return this._acceptCustomValue$;
  }

  get dataSource$(): Observable<DataSource | undefined> {
    return this._datasource$;
  }

  get displayExpr$(): Observable<string | undefined> {
    return this._displayExpr$;
  }

  get grouped$(): Observable<boolean> {
    return this._grouped$;
  }

  get hasLookupItemHint$(): Observable<boolean> {
    return this._hasLookupItemHint$;
  }

  get valueExpr$(): Observable<string | undefined> {
    return this._valueExpr$;
  }

  readonly getLookupItemKeyValue = (item: Record<string, unknown>): string|undefined => {
    if (this._keyValueGetter) {
      return this._keyValueGetter(item)?.toString();
    }

    return undefined;
  }

  readonly getLookupItemDisplayValue = (item: Record<string, unknown>): string|undefined => {
    if (this._displayValueGetter) {
      return this._displayValueGetter(item)?.toString();
    }

    return undefined;
  }

  readonly getLookupItemHintValue = (item: Record<string, unknown>): string|undefined => {
    if (this._hintValueGetter) {
      return this._hintValueGetter(item)?.toString();
    }

    return undefined;
  }

  readonly onCustomItemCreating = (event: SelectBoxCustomItemCreatingEvent | TagBoxCustomItemCreatingEvent): void => {
    event.customItem = {};

    if (this._keyValueSetter) {
      this._keyValueSetter(event.customItem, event.text);
    }

    if (this._displayValueSetter) {
      this._displayValueSetter(event.customItem, event.text);
    }
  }

  readonly setAcceptCustomValue = (accept: boolean): void => {
    this._acceptCustomValue$.next(accept);
  }

  readonly setLookupItems = (items: Array<any>): void => {
    this._datasource$.next(createArrayDatasource(items));
  }
}

class LookupDelegateBuilderImpl implements LookupDelegateBuilder {
  private identifier: string | undefined;
  private valueExpr: string | undefined;
  private displayExpr: string | undefined;
  private hintExpr: string | undefined;
  private paramMember: string | undefined;
  private paramMemberDelegate: ((dataMember: string) => string|string[]) | undefined;
  private pickvalueEntity: string | undefined;
  private pickvalueField: string | undefined
  private groupBy: string | undefined;
  private staticItems: Array<Record<string, unknown>> | undefined;
  private itemsMember: string | undefined;
  private itemsDelegate: ((dataMember: string) => Array<Record<string, unknown>>) | undefined;
  private acceptCustomValue: boolean = false;
  private unknownLookupFallbackHandler: ((identifier: string) => LookupDescriptor) | undefined;
  private apiErrorHandler: ((error: ApiError) => void) | undefined;

  constructor(private readonly lookups: Record<string, unknown>) {}

  readonly forIdentifier = (lookupIdentifier: string): LookupDelegateBuilder => {
    this.identifier = lookupIdentifier;
    return this;
  }

  readonly forStaticItems = (items: Array<Record<string, unknown>>): LookupDelegateBuilder => {
    this.staticItems = items;
    return this;
  }

  readonly forItemsFromMember = (dataMember: string, getDelegate: (dataMember: string) => Array<Record<string, unknown>>): LookupDelegateBuilder => {
    this.itemsMember = dataMember;
    this.itemsDelegate = getDelegate;
    return this;
  }

  readonly withDisplayExpr = (displayExpr: string): LookupDelegateBuilder => {
    this.displayExpr = displayExpr;
    return this;
  }

  readonly withHintExpr = (hintExpr: string): LookupDelegateBuilder => {
    this.hintExpr = hintExpr;
    return this;
  }

  readonly withValueExpr = (valueExpr: string): LookupDelegateBuilder => {
    this.valueExpr = valueExpr;
    return this;
  }

  readonly withParamFromMember = (dataMember: string, getDelegate: (dataMember: string) => string|string[]): LookupDelegateBuilder => {
    this.paramMember = dataMember;
    this.paramMemberDelegate = getDelegate;
    return this;
  }

  readonly withPickvaluesForEntityAndField = (entity: string, field: string): LookupDelegateBuilder => {
    this.pickvalueEntity = entity;
    this.pickvalueField = field;
    return this;
  }

  readonly withGroupBy = (groupBy: string): LookupDelegateBuilder => {
    this.groupBy = groupBy;
    return this;
  }

  readonly withAcceptCustomValue = (accept: boolean): LookupDelegateBuilder => {
    this.acceptCustomValue = accept;
    return this;
  }

  readonly withUnknownLookupFallback = (fallback: (identifier: string) => LookupDescriptor): LookupDelegateBuilder => {
    this.unknownLookupFallbackHandler = fallback;
    return this;
  }

  readonly withApiErrorHandler = (handler: (error: ApiError) => void): LookupDelegateBuilder => {
    this.apiErrorHandler = handler;
    return this;
  }

  readonly build = () => {

    let lookup =
      this.identifier && this.lookups
        ? (this.lookups[this.identifier] as LookupDescriptor|LookupCreator) : undefined;

    if (!lookup && this.identifier && this.unknownLookupFallbackHandler) {
      lookup = this.unknownLookupFallbackHandler(this.identifier);
    }

    let lookupInstance: LookupDescriptor|undefined;
    let datasource: DataSource|undefined;

    let keyValueExpr: string|undefined;
    let displayValueExpr: string|undefined;
    let keyValueGetter: ((item: unknown) => unknown)|undefined;
    let keyValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined;
    let displayValueGetter: ((item: unknown) => unknown)|undefined;
    let displayValueSetter: ((item: Record<string, unknown>, value: unknown) => void)|undefined;
    let hintValueGetter: ((item: Record<string, unknown>) => unknown)|undefined;

    if (lookup) {
      if (this.paramMember && this.paramMemberDelegate && lookup as LookupCreator) {
        lookupInstance = (lookup as LookupCreator)(this.paramMemberDelegate(this.paramMember) ?? this.paramMember);
      } else if (this.pickvalueEntity && this.pickvalueField && lookup as PickvalueCreator) {
        lookupInstance = (lookup as PickvalueCreator)(this.pickvalueEntity, this.pickvalueField);
      } else if (lookup as LookupDescriptor) {
        lookupInstance = lookup as LookupDescriptor;
      }

      if (lookupInstance && lookupInstance.type === 'lookup') {
        datasource = createDatasourceForRegularLookup(lookupInstance, this.groupBy, this.apiErrorHandler);

        keyValueExpr = this.valueExpr ?? lookupInstance.valueMember ?? 'Id';
        displayValueExpr = this.displayExpr ?? lookupInstance.displayMember ?? 'Name';
      } else if (lookupInstance && lookupInstance.type === 'autocomplete') {
        datasource = createDatasourceForAutocompleteLookup(lookupInstance, this.apiErrorHandler);

        keyValueGetter = (item: unknown) => item as string;
        displayValueGetter = (item) => item as string;
      }
    } else if (this.staticItems) {
      datasource = createArrayDatasource(this.staticItems);
    } else if (this.itemsMember && this.itemsDelegate) {
      const items = this.itemsDelegate(this.itemsMember);

      datasource = createArrayDatasource(items);
    }

    keyValueExpr = keyValueExpr || this.valueExpr || 'Id';
    displayValueExpr = displayValueExpr || this.displayExpr || 'Name';

    keyValueGetter = keyValueGetter || compileGetter(keyValueExpr) as ((item: unknown) => unknown);
    keyValueSetter = keyValueSetter || compileSetter(keyValueExpr) as ((item: Record<string, unknown>, value: unknown) => void);
    displayValueGetter = displayValueGetter || compileGetter(displayValueExpr) as ((item: unknown) => unknown);
    displayValueSetter = displayValueSetter || compileSetter(displayValueExpr) as ((item: Record<string, unknown>, value: unknown) => void);
    hintValueGetter = hintValueGetter || (this.hintExpr ? compileGetter(this.hintExpr) as ((item: Record<string, unknown>) => unknown) : undefined);

    return new LookupDelegateImpl({
      datasource,
      keyValueExpr,
      displayValueExpr,
      hintValueExpr: this.hintExpr,
      keyValueGetter,
      displayValueGetter,
      hintValueGetter,
      keyValueSetter,
      displayValueSetter,
      groupBy: this.groupBy,
      acceptCustomValue: this.acceptCustomValue
    });
  }
}

export const createLookupDelegateBuilder = (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => {
  return new LookupDelegateBuilderImpl(lookups);
}
