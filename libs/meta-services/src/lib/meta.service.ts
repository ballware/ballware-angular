import { Injectable, OnDestroy } from '@angular/core';
import { CompiledEntityMetadata, CrudItem, DocumentSelectEntry, EditLayout, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayout, GridLayoutColumn, QueryParams, Template, ValueType } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { EditModes } from './editmodes';

export interface MetaServiceApi {
  setIdentifier(identifier: string): void;
  setEntity(entity: string): void;
  setReadOnly(readOnly: boolean): void;
  setHeadParams(headParams: QueryParams): void;
  setInitialCustomParam(customParam: Record<string, unknown>|undefined): void;

  headParams$: Observable<QueryParams|undefined>;
  customParam$: Observable<Record<string, unknown>|undefined>;

  displayName$: Observable<string|undefined>;
  entityMetadata$: Observable<CompiledEntityMetadata|undefined>;
  entityDocuments$: Observable<DocumentSelectEntry[]|undefined>;

  entityTemplates$: Observable<Template[]|undefined>;

  customFunctions$: Observable<EntityCustomFunction[]|undefined>;
  prepareCustomFunction$: Observable<((identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams) => void)|undefined>;
  evaluateCustomFunction$: Observable<((identifier: string, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void) => void)|undefined>;

  getGridLayout$: Observable<((identifier: string) => GridLayout|undefined)|undefined>;
  getEditLayout$: Observable<((identifier: string, mode: EditModes) => EditLayout|undefined)|undefined>;

  query$: Observable<((query: string, params: QueryParams) => Observable<CrudItem[]>)|undefined>;
  count$: Observable<((query: string, params: QueryParams) => Observable<number>)|undefined>;
  byId$: Observable<((id: string) => Observable<CrudItem>)|undefined>;
  create$: Observable<((query: string, params: QueryParams) => Observable<CrudItem>)|undefined>;
  save$: Observable<((query: string, item: CrudItem) => Observable<void>)|undefined>;
  saveBatch$: Observable<((query: string, items: CrudItem[]) => Observable<void>)|undefined>;
  drop$: Observable<((item: CrudItem) => Observable<void>) | undefined>;
  importItems$: Observable<((query: string, file: File) => Observable<void>)|undefined>;
  exportItems$: Observable<((query: string, items: CrudItem[]) => Observable<string>)|undefined>;

  addFunction$: Observable<EntityCustomFunction|undefined>;
  viewFunction$: Observable<EntityCustomFunction|undefined>;
  editFunction$: Observable<EntityCustomFunction|undefined>;

  dropAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  printAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  customFunctionAllowed$: Observable<((customFunction: EntityCustomFunction, item?: CrudItem) => boolean)|undefined>;

  editorPreparing$: Observable<((mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string) => void)|undefined>;
  editorInitialized$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  editorEntered$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  editorValueChanged$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType) => void)|undefined>;
  editorValidating$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string) => boolean)|undefined>;
  editorEvent$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string) => void)|undefined>; 
  
  detailGridCellPreparing$: Observable<((
      mode: EditModes,
      item: Record<string, unknown>,
      detailItem: Record<string, unknown>,
      identifier: string,
      options: GridLayoutColumn
  ) => void)|undefined>;

  detailGridRowValidating$: Observable<((
      mode: EditModes,
      item: Record<string, unknown>,
      detailItem: Record<string, unknown>,
      identifier: string
  ) => string)|undefined>;

  initNewDetailItem$: Observable<((
      dataMember: string,
      item: Record<string, unknown>,
      detailItem: Record<string, unknown>
  ) => void)|undefined>;
}

@Injectable()
export abstract class MetaService implements OnDestroy, MetaServiceApi {  
  public abstract ngOnDestroy(): void;

  public abstract setIdentifier(identifier: string): void;

  public abstract setEntity(entity: string): void;
  public abstract setReadOnly(readOnly: boolean): void;
  public abstract setHeadParams(headParams: QueryParams): void;
  public abstract setInitialCustomParam(customParam: Record<string, unknown>|undefined): void;

  public abstract headParams$: Observable<QueryParams|undefined>;
  public abstract customParam$: Observable<Record<string, unknown>|undefined>;

  public abstract displayName$: Observable<string|undefined>;
  public abstract entityMetadata$: Observable<CompiledEntityMetadata|undefined>;
  public abstract entityDocuments$: Observable<DocumentSelectEntry[]|undefined>;
  public abstract entityTemplates$: Observable<Template[] | undefined>;

  public abstract customFunctions$: Observable<EntityCustomFunction[]|undefined>;
  public abstract prepareCustomFunction$: Observable<((identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams) => void)|undefined>;
  public abstract evaluateCustomFunction$: Observable<((identifier: string, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void) => void)|undefined>;

  public abstract getGridLayout$: Observable<((identifier: string) => GridLayout|undefined)|undefined>;
  public abstract getEditLayout$: Observable<((identifier: string, mode: EditModes) => EditLayout|undefined)|undefined>;

  public abstract query$: Observable<((query: string, params: QueryParams) => Observable<CrudItem[]>)|undefined>;
  public abstract count$: Observable<((query: string, params: QueryParams) => Observable<number>)|undefined>;
  public abstract byId$: Observable<((id: string) => Observable<CrudItem>)|undefined>;
  public abstract create$: Observable<((query: string, params: QueryParams) => Observable<CrudItem>)|undefined>;
  public abstract save$: Observable<((query: string, item: CrudItem) => Observable<void>) | undefined>;
  public abstract saveBatch$: Observable<((query: string, items: CrudItem[]) => Observable<void>) | undefined>;
  public abstract drop$: Observable<((item: CrudItem) => Observable<void>) | undefined>;
  public abstract importItems$: Observable<((query: string, file: File) => Observable<void>)|undefined>;
  public abstract exportItems$: Observable<((query: string, items: CrudItem[]) => Observable<string>)|undefined>;
  
  public abstract addFunction$: Observable<EntityCustomFunction|undefined>;
  public abstract viewFunction$: Observable<EntityCustomFunction|undefined>;
  public abstract editFunction$: Observable<EntityCustomFunction|undefined>;

  public abstract dropAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public abstract printAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public abstract customFunctionAllowed$: Observable<((customFunction: EntityCustomFunction, item?: CrudItem) => boolean)|undefined>;

  public abstract editorPreparing$: Observable<((mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string) => void)|undefined>;
  public abstract editorInitialized$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  public abstract editorEntered$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  public abstract editorValueChanged$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType) => void)|undefined>;
  public abstract editorValidating$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string) => boolean)|undefined>;
  public abstract editorEvent$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string) => void)|undefined>;

  public abstract detailGridCellPreparing$: Observable<((mode: EditModes, item: Record<string, unknown>, detailItem: Record<string, unknown>, identifier: string, options: GridLayoutColumn) => void) | undefined>;
  public abstract detailGridRowValidating$: Observable<((mode: EditModes, item: Record<string, unknown>, detailItem: Record<string, unknown>, identifier: string) => string) | undefined>;
  public abstract initNewDetailItem$: Observable<((dataMember: string, item: Record<string, unknown>, detailItem: Record<string, unknown>) => void) | undefined>;
}
