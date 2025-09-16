import { InjectionToken, OnDestroy } from '@angular/core';
import { CompiledEntityMetadata, CrudItem, DocumentSelectEntry, EditLayout, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayout, GridLayoutColumn, QueryParams, Template, ValueType } from '@ballware/meta-model';
import { Observable, Subscription } from 'rxjs';
import { EditModes } from './editmodes';
import { LookupService } from './lookup.service';

export interface MetaService extends OnDestroy {
  setIdentifier(identifier: string): void;
  setEntity(entity: string): void;
  setReadOnly(readOnly: boolean): void;
  setHeadParams(headParams: QueryParams): void;
  setInitialCustomParam(customParam: Record<string, unknown>|undefined): void;

  ready$: Observable<boolean>;

  headParams$: Observable<QueryParams|undefined>;
  customParam$: Observable<Record<string, unknown>|undefined>;

  entity$: Observable<string|undefined>;
  displayName$: Observable<string|undefined>;
  entityMetadata$: Observable<CompiledEntityMetadata|undefined>;
  entityDocuments$: Observable<DocumentSelectEntry[]|undefined>;

  entityTemplates$: Observable<Template[]|undefined>;

  customFunctions$: Observable<EntityCustomFunction[]|undefined>;

  prepareCustomFunction: (request: { identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams }) => Subscription;
  evaluateCustomFunction: (request: { identifier: string,  continueAfterSave: boolean, editUtil: EditUtil, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void }) => Subscription;

  getGridLayout: (identifier: string) => Observable<GridLayout|undefined>;
  getEditLayout: (identifier: string, mode: EditModes) => Observable<EditLayout|undefined>;

  query: (query: string, params: QueryParams) => Observable<CrudItem[]>;
  count: (query: string, params: QueryParams) => Observable<number>;
  byId: (query: string, id: string) => Observable<CrudItem>;
  create: (query: string, params: QueryParams) => Observable<CrudItem>;
  save: (query: string, item: CrudItem) => Observable<void>;
  saveBatch: (query: string, items: CrudItem[]) => Observable<void>;
  drop: (item: CrudItem) => Observable<void>;
  importItems: (query: string, file: File) => Observable<void>;
  exportItems: (query: string, items: CrudItem[]) => Observable<string>;

  addFunction$: Observable<EntityCustomFunction|undefined>;
  viewFunction$: Observable<EntityCustomFunction|undefined>;
  editFunction$: Observable<EntityCustomFunction|undefined>;

  dropAllowed: (item: CrudItem) => Observable<boolean>;
  printAllowed: (item: CrudItem) => Observable<boolean>;
  customFunctionAllowed: (customFunction: EntityCustomFunction, item?: CrudItem) => Observable<boolean>;

  editorPreparing: (request: { mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string }) => Observable<EditLayoutItem>;
  editorInitialized: (request: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string }) => Subscription;
  editorEntered: (request: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string }) => Subscription;
  editorValueChanged: (request: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType }) => Subscription;
  editorValidating: (request: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string }) => Observable<boolean>;
  editorEvent: (request: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string }) => Subscription;

  interactionKeyboardLine: (request: {
                              mode: EditModes,
                              item: Record<string, unknown>,
                              editUtil: EditUtil,
                              value: string
                            }
  ) => Subscription;

  detailGridCellPreparing: (request: {
                              mode: EditModes,
                              item: Record<string, unknown>,
                              detailItem: Record<string, unknown>,
                              identifier: string,
                              options: GridLayoutColumn
                            }
  ) => Observable<GridLayoutColumn>;

  detailGridRowValidating: (request: {
                              mode: EditModes,
                              item: Record<string, unknown>,
                              detailItem: Record<string, unknown>,
                              identifier: string
                            }
  ) => Observable<string | undefined>;

  initNewDetailItem: (request: {
                        dataMember: string,
                        item: Record<string, unknown>,
                        detailItem: Record<string, unknown>
                      }
  ) => Observable<Record<string, unknown>>;
}

export type MetaServiceFactory = (lookupService: LookupService) => MetaService;

export const META_SERVICE = new InjectionToken<MetaService>('Meta service');
export const META_SERVICE_FACTORY = new InjectionToken<MetaServiceFactory>('Meta service factory');
