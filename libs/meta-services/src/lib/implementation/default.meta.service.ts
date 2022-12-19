import { HttpClient } from '@angular/common/http';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, of, ReplaySubject, share, switchMap, takeUntil } from 'rxjs';
import { CompiledEntityMetadata, CrudItem, DocumentSelectEntry, EditLayout, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayout, QueryParams, ValueType } from '@ballware/meta-model';
import { AuthService } from '../auth.service';
import { createUtil } from './createscriptutil';
import { EditModes } from '../editmodes';
import { LookupRequest, LookupService } from '../lookup.service';
import { TenantService } from '../tenant.service';
import { MetaApiService } from '@ballware/meta-api';
import { MetaService } from '../meta.service';
import { Injectable } from '@angular/core';

@Injectable()
export class DefaultMetaService extends MetaService {

  private _entity$ = new BehaviorSubject<string|undefined>(undefined);
  private _readOnly$ = new BehaviorSubject<boolean>(false);
  private _headParams$ = new BehaviorSubject<QueryParams|undefined>(undefined);

  private initialCustomParam$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);

  private _customParam$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);

  public displayName$: Observable<string|undefined>;
  public entityMetadata$: Observable<CompiledEntityMetadata|undefined>;
  public entityDocuments$: Observable<DocumentSelectEntry[]|undefined>;

  public customFunctions$: Observable<EntityCustomFunction[]|undefined>;
  public prepareCustomFunction$: Observable<((identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams) => void)|undefined>;
  public evaluateCustomFunction$: Observable<((identifier: string, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void) => void)|undefined>;

  public getGridLayout$: Observable<((identifier: string) => GridLayout|undefined)|undefined>;
  public getEditLayout$: Observable<((identifier: string, mode: EditModes) => EditLayout|undefined)|undefined>;

  public query$: Observable<((query: string, params: QueryParams) => Observable<CrudItem[]>)|undefined>;
  public count$: Observable<((query: string, params: QueryParams) => Observable<number>)|undefined>;
  public byId$: Observable<((id: string) => Observable<CrudItem>)|undefined>;
  public create$: Observable<((query: string, params: QueryParams) => Observable<CrudItem>)|undefined>;

  public addAllowed$: Observable<(() => boolean)|undefined>;
  public viewAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public editAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public dropAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public printAllowed$: Observable<((item: CrudItem) => boolean)|undefined>;
  public customFunctionAllowed$: Observable<((customFunction: EntityCustomFunction, item?: CrudItem) => boolean)|undefined>;

  private headAllowed$: Observable<((rights: string) => boolean)|undefined>;
  private itemAllowed$: Observable<((item: CrudItem, right: string) => boolean)|undefined>;

  public editorPreparing$: Observable<((mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string) => void)|undefined>;
  public editorInitialized$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  public editorEntered$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
  public editorValueChanged$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType) => void)|undefined>;
  public editorValidating$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string) => boolean)|undefined>;
  public editorEvent$: Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string) => void)|undefined>;

  public setEntity(entity: string) {
    this._entity$.next(entity);
  }

  public setHeadParams(headParams: QueryParams) {
    this._headParams$.next(headParams);
  }

  public setReadonly(readOnly: boolean): void {
    this._readOnly$.next(readOnly);
  }

  public get headParams$() {
    return this._headParams$.pipe(distinctUntilChanged());
  }

  public get customParam$() {
    return this._customParam$;
  }

  constructor(private httpClient: HttpClient, private metaApiService: MetaApiService, private authService: AuthService, private tenantService: TenantService, private lookupService: LookupService) {

    super();

    this.entityMetadata$ = combineLatest([
        this._entity$,
        this.metaApiService.metaEntityApiFactory$
      ]).pipe(takeUntil(this.destroy$))
        .pipe(switchMap(([entity, entityApiFactory]) =>
          (entity && entityApiFactory) ? entityApiFactory().metadataForEntity(this.httpClient, entity)
          : of(undefined)
        ))
        .pipe(share({ connector: () => new ReplaySubject(), resetOnRefCountZero: false, resetOnComplete: false, resetOnError: true }));

    combineLatest([this.entityMetadata$, this.lookupService.lookups$, this.initialCustomParam$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([entityMetadata, lookups, initialCustomParam]) => {
        if (lookups && entityMetadata && initialCustomParam) {
          if (entityMetadata.compiledCustomScripts?.prepareCustomParam) {
            entityMetadata.compiledCustomScripts.prepareCustomParam(lookups, createUtil(this.httpClient), (customParam) => {
              this._customParam$.next(customParam);
            });
          } else {
            this._customParam$.next(initialCustomParam);
          }
        }
      });

    this.entityDocuments$ = combineLatest([
      this._entity$,
      this.metaApiService.metaEntityApiFactory$
    ]).pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([entity, entityApiFactory]) =>
        (entity && entityApiFactory) ? entityApiFactory().documentsForEntity(this.httpClient, entity) : of(undefined)
      ));

    this.headAllowed$ = combineLatest([
      this._readOnly$,
      this._customParam$,
      this.authService.currentUser$,
      this.tenantService.hasRight$,
      this.entityMetadata$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([readOnly, customParam, currentUser, hasRight, entityMetadata]) => (right: string) => {
          return (
            entityMetadata &&
            currentUser &&
            !readOnly &&
            hasRight &&
            (entityMetadata.compiledCustomScripts?.rightsCheck ?
              entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly, right, entityMetadata.compiledCustomScripts?.rightsParamForHead
                ? entityMetadata.compiledCustomScripts.rightsParamForHead(customParam)
                : undefined,
                hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
              : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
          ) ?? false;
        }));

    this.itemAllowed$ = combineLatest([
      this._readOnly$,
      this._customParam$,
      this.authService.currentUser$,
      this.tenantService.hasRight$,
      this.entityMetadata$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([readOnly, customParam, currentUser, hasRight, entityMetadata]) => (item: CrudItem, right: string) => {
        return (
          entityMetadata && hasRight && currentUser &&
          (entityMetadata.compiledCustomScripts?.rightsCheck ?
            entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly, right, entityMetadata.compiledCustomScripts?.rightsParamForItem
              ? entityMetadata.compiledCustomScripts.rightsParamForItem(item, customParam)
              : undefined,
              hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
            : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
        ) ?? false;
      }));

    this.addAllowed$ = combineLatest([this.headAllowed$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([headAllowed]) => headAllowed ? () => headAllowed('add') : undefined));

    this.viewAllowed$ = combineLatest([this.itemAllowed$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([itemAllowed]) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'view') : undefined));

    this.editAllowed$ = combineLatest([this.itemAllowed$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([itemAllowed]) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'edit') : undefined));

    this.dropAllowed$ = combineLatest([this.itemAllowed$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([itemAllowed]) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'delete') : undefined));

    this.printAllowed$ = combineLatest([this.itemAllowed$, this.entityDocuments$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([itemAllowed, entityDocuments]) => (entityDocuments && entityDocuments.length > 0 && itemAllowed) ? (item: CrudItem) => itemAllowed(item, 'print') : undefined));

    this.customFunctionAllowed$ = combineLatest([this.headAllowed$, this.itemAllowed$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([headAllowed, itemAllowed]) => (headAllowed && itemAllowed) ? (customFunction: EntityCustomFunction, item?: CrudItem) =>
        customFunction.type === 'edit' && item ? itemAllowed(item, customFunction.id) : headAllowed(customFunction.id)
        : undefined));

    this.displayName$ = this.entityMetadata$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((entityMetadata) => entityMetadata?.displayName ?? entityMetadata?.entity));

    this.customFunctions$ = this.entityMetadata$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((entityMetadata) => entityMetadata ? entityMetadata.customFunctions ?? [] : undefined));

    this.getGridLayout$ = combineLatest([
      this._customParam$,
      this.entityMetadata$,
      this.lookupService.lookups$
    ])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([customParam, entityMetadata, lookups]) => (customParam && entityMetadata && lookups) ? (identifier) => {
        const gridLayout = entityMetadata.gridLayouts?.find(layout => layout.identifier === identifier);

        if (gridLayout && entityMetadata.compiledCustomScripts?.prepareGridLayout) {
          const preparedGridLayout = cloneDeep(gridLayout);

          entityMetadata.compiledCustomScripts?.prepareGridLayout(lookups, customParam, createUtil(this.httpClient), preparedGridLayout);

          return preparedGridLayout;
        }

        return gridLayout;
      } : undefined));

    this.getEditLayout$ = combineLatest([
      this._customParam$,
      this.entityMetadata$,
      this.lookupService.lookups$
    ])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([customParam, entityMetadata, lookups]) => (customParam && entityMetadata && lookups) ? (identifier, mode) => {
        const editLayout = entityMetadata.editLayouts?.find(layout => layout.identifier === identifier);

        if (editLayout && entityMetadata.compiledCustomScripts?.prepareEditLayout) {
          const preparedEditLayout = cloneDeep(editLayout);

          entityMetadata.compiledCustomScripts?.prepareEditLayout(mode, lookups, customParam, createUtil(this.httpClient), preparedEditLayout);

          return preparedEditLayout;
        }

        return editLayout;
      } : undefined));

    this.count$ = combineLatest([this.entityMetadata$, this.metaApiService.metaGenericEntityApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, genericApiFactory]) => (entityMetadata && genericApiFactory)
        ? (query, params) => genericApiFactory(entityMetadata.baseUrl).count(this.httpClient, query, params)
          .pipe(share({ connector: () => new ReplaySubject(), resetOnRefCountZero: false, resetOnComplete: false, resetOnError: true }))
        : undefined));

    this.query$ = combineLatest([this._customParam$, this.entityMetadata$, this.metaApiService.metaGenericEntityApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([customParam, entityMetadata, genericApiFactory]) => (customParam && entityMetadata && genericApiFactory)
        ? (query, params) => genericApiFactory(entityMetadata.baseUrl)
          .query(this.httpClient, query, params)
          .pipe(map((items) => entityMetadata.itemMappingScript ? items?.map(item => entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient))) : items))
        : undefined));

    this.byId$ = combineLatest([this._customParam$, this.entityMetadata$, this.metaApiService.metaGenericEntityApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([customParam, entityMetadata, genericApiFactory]) => (customParam && entityMetadata && genericApiFactory)
        ? (id) => genericApiFactory(entityMetadata.baseUrl)
          .byId(this.httpClient, 'primary', id)
          .pipe(map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient)) : item))
        : undefined));

    this.create$ = combineLatest([this._customParam$, this.entityMetadata$, this.metaApiService.metaGenericEntityApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([customParam, entityMetadata, genericApiFactory]) => (customParam && entityMetadata && genericApiFactory)
        ? (query, params) => genericApiFactory(entityMetadata.baseUrl)
          .new(this.httpClient, query, params)
          .pipe(map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient)) : item))
        : undefined));

    this.prepareCustomFunction$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (identifier, selection, execute, message, params) => {
          if (entityMetadata.compiledCustomScripts?.prepareCustomFunction) {
            entityMetadata.compiledCustomScripts.prepareCustomFunction(
              identifier,
              lookups,
              createUtil(this.httpClient),
              execute,
              message,
              params,
              selection
            );
          } else {
            selection?.forEach(s => execute(s));
          }
        }
        : undefined));

    this.evaluateCustomFunction$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (identifier, param, save, message) => {
          if (entityMetadata.compiledCustomScripts?.evaluateCustomFunction) {
            entityMetadata.compiledCustomScripts.evaluateCustomFunction(
              identifier,
              lookups,
              createUtil(this.httpClient),
              param,
              save,
              message
            );
          } else {
            save(param);
          }
        }
        : undefined));

    this.editorPreparing$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (mode, item, layoutItem, identifier) => layoutItem.options && entityMetadata.compiledCustomScripts?.editorPreparing && entityMetadata.compiledCustomScripts?.editorPreparing(mode, item, layoutItem.options, identifier, lookups, createUtil(this.httpClient))
        : undefined));

    this.editorInitialized$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (mode, item, editUtil, identifier) => entityMetadata.compiledCustomScripts?.editorInitialized && entityMetadata.compiledCustomScripts.editorInitialized(mode, item, editUtil, identifier, lookups, createUtil(this.httpClient))
        : undefined));

    this.editorEntered$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (mode, item, editUtil, identifier) => entityMetadata.compiledCustomScripts?.editorEntered && entityMetadata.compiledCustomScripts.editorEntered(mode, item, editUtil, identifier, lookups, createUtil(this.httpClient))
        : undefined));

    this.editorValueChanged$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (_mode, item, editUtil, identifier, value) => entityMetadata.compiledCustomScripts?.editorValueChanged && entityMetadata.compiledCustomScripts.editorValueChanged(item, editUtil, identifier, value, lookups, createUtil(this.httpClient))
        : undefined));

    this.editorValidating$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (_mode, item, editUtil, identifier, value, validation) => entityMetadata.compiledCustomScripts?.editorValidating ? entityMetadata.compiledCustomScripts.editorValidating(item, editUtil, identifier, value, validation, lookups, createUtil(this.httpClient)) : true
        : undefined));

    this.editorEvent$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
        ? (_mode, item, editUtil, identifier, event) => entityMetadata.compiledCustomScripts?.editorEvent && entityMetadata.compiledCustomScripts.editorEvent(item, editUtil, identifier, event, lookups, createUtil(this.httpClient))
        : undefined));

    combineLatest([this.entityMetadata$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([entityMetadata]) => {
        if (entityMetadata) {
          const lookups = [] as Array<LookupRequest>;

          if (entityMetadata.lookups) {
            lookups.push(...entityMetadata.lookups.map(l => {
              if (l.type === 1) {
                if (l.hasParam) {
                  return {
                    type: 'autocompletewithparam',
                    identifier: l.identifier,
                    lookupId: l.id,
                  } as LookupRequest;
                } else {
                  return {
                    type: 'autocomplete',
                    identifier: l.identifier,
                    lookupId: l.id,
                  } as LookupRequest;
                }
              } else {
                if (l.hasParam) {
                  return {
                    type: 'lookupwithparam',
                    identifier: l.identifier,
                    lookupId: l.id,
                    valueMember: l.valueMember,
                    displayMember: l.displayMember,
                  } as LookupRequest;
                } else {
                  return {
                    type: 'lookup',
                    identifier: l.identifier,
                    lookupId: l.id,
                    valueMember: l.valueMember,
                    displayMember: l.displayMember,
                  } as LookupRequest;
                }
              }
            }));
          }

          if (entityMetadata.picklists) {
            lookups.push(
              ...entityMetadata.picklists.map(p => {
                return {
                  type: 'pickvalue',
                  identifier: p.identifier,
                  entity: p.entity,
                  field: p.field,
                } as LookupRequest;
              })
            );
          }

          if (entityMetadata.stateColumn) {
            lookups.push(
              ...[
                {
                  type: 'state',
                  identifier: 'stateLookup',
                  entity: entityMetadata.entity,
                } as LookupRequest,
                {
                  type: 'stateallowed',
                  identifier: 'allowedStateLookup',
                  entity: entityMetadata.entity,
                } as LookupRequest,
              ]
            );
          }

          this.lookupService.requestLookups(lookups);
        }
      });
  }

  public setInitialCustomParam(customParam: Record<string, unknown>|undefined) {
    this.initialCustomParam$.next(customParam);
  }
}
