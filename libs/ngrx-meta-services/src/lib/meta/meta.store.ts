import { OnDestroy } from "@angular/core";
import { GenericEntityApiFactory, MetaDocumentApi, MetaEntityApi } from "@ballware/meta-api";
import { CrudItem, DocumentSelectEntry, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayoutColumn, QueryParams, ScriptUtil, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
  filter, throwError
} from 'rxjs';
import { metaDestroyed, metaUpdated } from "../component";
import { EditModes, IdentityService, LookupRequest, LookupService, MetaService, TenantService, Translator } from "@ballware/meta-services";
import { MetaState } from "./meta.state";

interface TemplateItemOptions {
    scope: 'tenant' | 'meta';
    identifier: string;
}

export class MetaStore extends ComponentStore<MetaState> implements MetaService, OnDestroy {
    constructor(private store: Store,
        private readonly scriptUtil: ScriptUtil,
        private translator: Translator,
        private metaEntityApi: MetaEntityApi,
        private metaDocumentApi: MetaDocumentApi,
        private genericEntityApiFactory: GenericEntityApiFactory,
        private identityService: IdentityService,
        private tenantService: TenantService,
        private lookupService: LookupService) {
        super({
          ready: false
        });

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                if (state.identifier) {
                    this.store.dispatch(metaUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Meta state update');
                    console.debug(state);
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(metaDestroyed({ identifier: state.identifier }));
                }
            });

        this.effect(_ => this.entity$.pipe(
            filter((entity) : entity is string => entity !== undefined),
            tap(() => this.patchState({ ready: false })),
            switchMap((entity) => this.metaEntityApi.metadataForEntity(entity)),
            tap((entityMetadata) => this.patchState({
                    entityMetadata,
                    displayName: entityMetadata?.displayName,
                    customFunctions: entityMetadata?.customFunctions ?? [],
                    entityTemplates: entityMetadata?.templates ?? [],
                    addFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_add')
                        ?? {
                            id: 'add',
                            type: 'default_add',
                            text: this.translator('datacontainer.actions.add', { entity: entityMetadata?.displayName }),
                            editLayout: 'primary'
                        },
                    viewFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_view')
                        ?? {
                            id: 'view',
                            type: 'default_view',
                            icon: 'bi bi-eye-fill',
                            text: this.translator('datacontainer.actions.show', { entity: entityMetadata?.displayName }),
                            editLayout: 'primary'
                        },
                    editFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_edit')
                        ?? {
                            id: 'edit',
                            type: 'default_edit',
                            icon: 'bi bi-pencil-fill',
                            text: this.translator('datacontainer.actions.edit', { entity: entityMetadata?.displayName }),
                            editLayout: 'primary'
                        },
                })),
            tap((entityMetadata) => {
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
                          type: 'metastateallowed',
                          identifier: 'allowedMetaStateLookup',
                          entity: entityMetadata.entity,
                        } as LookupRequest,
                        {
                          type: 'tenantstateallowed',
                          identifier: 'allowedStateLookup',
                          entity: entityMetadata.entity,
                        } as LookupRequest,
                      ]
                    );
                  }

                  this.lookupService.requestLookups(lookups);
            }),
          switchMap((entityMetadata) => this.metaDocumentApi.selectListDocumentsForEntity(entityMetadata.entity)),
          tap((entityDocuments) => {
              if (entityDocuments) {
                this.updater((state, entityDocuments: DocumentSelectEntry[]) => ({
                  ...state,
                  entityDocuments
                }))(entityDocuments);
              }
            })
        ));

        this.effect(_ => combineLatest([this.entityMetadata$, this.lookupService.lookups$, this.initialCustomParam$])
            .pipe(
              tap(([entityMetadata, lookups, initialCustomParam]) => {
                if (lookups && entityMetadata && initialCustomParam) {
                    if (entityMetadata.compiledCustomScripts?.prepareCustomParam) {
                        entityMetadata.compiledCustomScripts.prepareCustomParam(lookups, this.scriptUtil, initialCustomParam, (customParam) => {
                            this.setCustomParam(customParam);
                        });
                    } else {
                        this.setCustomParam(initialCustomParam);
                    }
                }
              }),
              tap(() => this.patchState({ ready: true }))
            ));
    }

    readonly ready$ = this.select(state => state.ready);
    readonly entity$ = this.select(state => state.entity);

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));

    readonly setEntity = this.updater((state, entity: string) => ({
            ...state,
            entity
        }));

    readonly readOnly$ = this.select(state => state.readOnly);

    readonly setReadOnly =
        this.updater((state, readOnly: boolean) => ({
            ...state,
            readOnly
        }));

    readonly headParams$ = this.select(state => state.headParams);

    readonly setHeadParams =
        this.updater((state, headParams: QueryParams) => ({
            ...state,
            headParams
        }));

    readonly initialCustomParam$ = this.select(state => state.initialCustomParam);

    readonly setInitialCustomParam =
        this.updater((state, initialCustomParam: Record<string, unknown>|undefined) => ({
            ...state,
            initialCustomParam
        }));

    readonly customParam$ = this.select(state => state.customParam);

    readonly setCustomParam =
        this.updater((state, customParam: Record<string, unknown>|undefined) => ({
            ...state,
            customParam
        }));

    readonly entityMetadata$ = this.select(state => state.entityMetadata);
    readonly entityDocuments$ = this.select(state => state.entityDocuments);
    readonly entityTemplates$ = this.select(state => state.entityTemplates);

    readonly displayName$ = this.select(state => state.displayName);
    readonly customFunctions$ = this.select(state => state.customFunctions);

    readonly addFunction$ = this.select(state => state.addFunction);
    readonly viewFunction$ = this.select(state => state.viewFunction);
    readonly editFunction$ = this.select(state => state.editFunction);

    readonly getGridLayout = (identifier: string) =>
      combineLatest([
        this.customParam$,
        this.entityMetadata$,
        this.lookupService.lookups$
      ]).pipe(
        switchMap(([customParam, entityMetadata, lookups]) => {
          if (!customParam || !entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          const gridLayout = entityMetadata.gridLayouts?.find(l => l.identifier === identifier);

          if (gridLayout && entityMetadata.compiledCustomScripts?.prepareGridLayout) {
            const prepared = cloneDeep(gridLayout);

            entityMetadata.compiledCustomScripts.prepareGridLayout(
              lookups, customParam, this.scriptUtil, prepared
            );

            return of(prepared);
          }

          return of(gridLayout);
        })
      );

    readonly getEditLayout = (identifier: string, mode: EditModes)=>
      combineLatest([
        this.customParam$,
        this.entityMetadata$,
        this.entityTemplates$,
        this.lookupService.lookups$,
        this.tenantService.tenantTemplates$,
      ]).pipe(
        switchMap(([customParam, entityMetadata, entityTemplates, lookups, tenantTemplates]) => {
          if (!customParam || !entityMetadata || !entityTemplates || !lookups || !tenantTemplates) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          const editLayout = entityMetadata.editLayouts?.find(layout => layout.identifier === identifier);
          if (editLayout) {
            const preparedEditLayout = cloneDeep(editLayout);

            const materializeTemplates = (items: EditLayoutItem[]) => {
              return items?.map(item => {
                if ('template' === item.type) {
                  const scope = (item.options?.itemoptions as TemplateItemOptions)?.scope;
                  const identifier = (item.options?.itemoptions as TemplateItemOptions)?.identifier;

                  let template: EditLayoutItem | undefined = undefined;

                  if (scope && identifier) {
                    switch (scope) {
                      case 'tenant':
                        template = tenantTemplates.find(t => t.identifier === identifier)?.definition;
                        break;
                      case 'meta':
                        template = entityTemplates.find(t => t.identifier === identifier)?.definition;
                    }
                  }

                  if (template) {
                    item.type = template.type;
                    item.colCount = template.colCount;
                    item.colSpan = template.colSpan;
                    item.options = template.options;
                    item.items = template.items;

                    if (entityMetadata.compiledCustomScripts?.prepareMaterializedEditItem) {
                      entityMetadata.compiledCustomScripts?.prepareMaterializedEditItem(mode, lookups, customParam, this.scriptUtil, editLayout, scope, identifier, item);
                    }
                  }
                } else {
                  item.items = item.items && materializeTemplates(item.items);
                }

                return item;
              });
            };

            preparedEditLayout.items = materializeTemplates(preparedEditLayout.items);

            if (entityMetadata.compiledCustomScripts?.prepareEditLayout) {

              entityMetadata.compiledCustomScripts?.prepareEditLayout(mode, lookups, customParam, this.scriptUtil, preparedEditLayout);
            }

            return of(preparedEditLayout);
          }

          return of(undefined);
        })
      );

    private readonly headAllowed = (right: string) =>
      combineLatest([
        this.readOnly$,
        this.customParam$,
        this.headParams$,
        this.identityService.currentUser$,
        this.tenantService.hasRight$,
        this.entityMetadata$
      ]).pipe(
        switchMap(([readOnly, customParam, headParams, currentUser, hasRight, entityMetadata]) => {
          if (!entityMetadata || !customParam || !headParams || !currentUser || !hasRight) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(
            !readOnly &&
            (entityMetadata.compiledCustomScripts?.rightsCheck ?
              entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly ?? false, right, entityMetadata.compiledCustomScripts?.rightsParamForHead
                  ? entityMetadata.compiledCustomScripts.rightsParamForHead(customParam, headParams)
                  : headParams,
                hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
              : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
          );
        })
      );

    private readonly itemAllowed = (item: CrudItem, right: string) =>
      combineLatest([
        this.readOnly$,
        this.customParam$,
        this.headParams$,
        this.identityService.currentUser$,
        this.tenantService.hasRight$,
        this.entityMetadata$]).pipe(
          switchMap(([readOnly, customParam, headParams, currentUser, hasRight, entityMetadata]) => {
            if (!entityMetadata || !customParam || !headParams || !currentUser || !hasRight) {
              return throwError(() => new Error('MetaService: Not initialized'));
            }

            return of(
              (entityMetadata.compiledCustomScripts?.rightsCheck ?
                entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly ?? false, right, entityMetadata.compiledCustomScripts?.rightsParamForItem
                    ? entityMetadata.compiledCustomScripts.rightsParamForItem(item, customParam, headParams)
                    : headParams,
                  hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
                : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
            )
          }));

    readonly dropAllowed = (item: CrudItem) =>
      this.itemAllowed(item, 'delete');

    readonly printAllowed = (item: CrudItem) =>
      combineLatest([this.entityDocuments$, this.itemAllowed(item, 'print')]).pipe(
        switchMap(([entityDocuments, printAllowed]) => {
          if (!entityDocuments) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(printAllowed && entityDocuments.length > 0);
        })
      );

    readonly customFunctionAllowed = (customFunction: EntityCustomFunction, item?: CrudItem)=>
      (customFunction.type === 'default_view' || customFunction.type === 'default_edit' || customFunction.type === 'edit') && item
        ? this.itemAllowed(item, customFunction.id)
        : this.headAllowed(customFunction.id);

    readonly count= (query: string, params: QueryParams) =>
      this.entityMetadata$.pipe(
        switchMap((entityMetadata) => {
          if (!entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl).count(query, params);
        })
      );


    readonly query = (query: string, params: QueryParams) =>
      combineLatest([this.customParam$, this.entityMetadata$]).pipe(
        switchMap(([customParam, entityMetadata]) => {
            if (!customParam || !entityMetadata) {
              return throwError(() => new Error('MetaService: Not initialized'));
            }

            return this.genericEntityApiFactory(entityMetadata.baseUrl)
              .query(query, params)
              .pipe(
                map((items) => entityMetadata.itemMappingScript ? items?.map(item => entityMetadata.itemMappingScript(item, customParam, this.scriptUtil)) : items)
              );
          })
        );

    readonly byId = (query: string, id: string) =>
      combineLatest([this.customParam$, this.entityMetadata$]).pipe(
        switchMap(([customParam, entityMetadata]) => {
          if (!customParam || !entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
              .byId(query, id)
              .pipe(
                map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, this.scriptUtil) : item)
              );
        })
      );

    readonly create = (query: string, params: QueryParams) =>
      combineLatest([this.customParam$, this.entityMetadata$]).pipe(
        switchMap(([customParam, entityMetadata]) => {
          if (!customParam || !entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .new(query, params)
            .pipe(
              map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, this.scriptUtil) : item)
            );
        })
      );

    readonly save = (query: string, item: CrudItem) =>
      combineLatest([this.customParam$, this.entityMetadata$]).pipe(
        switchMap(([customParam, entityMetadata]) => {
          if (!customParam || !entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .save(query, entityMetadata.itemReverseMappingScript ? entityMetadata.itemReverseMappingScript(item, customParam, this.scriptUtil) : item);
        })
      );

    readonly saveBatch = (query: string, items: CrudItem[]) =>
      combineLatest([this.customParam$, this.entityMetadata$]).pipe(
        switchMap(([customParam, entityMetadata]) => {
          if (!customParam || !entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .saveBatch(query, entityMetadata.itemReverseMappingScript ? items.map(item => entityMetadata.itemReverseMappingScript(item, customParam, this.scriptUtil)) : items);
        })
      );

    readonly drop = (item: CrudItem) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .drop(item.Id);
        })
      );

    readonly exportItems = (query: string, items: CrudItem[]) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .exportItems(query, items.map(item => item.Id));
        })
      );

    readonly importItems = (query: string, file: File) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return this.genericEntityApiFactory(entityMetadata.baseUrl)
            .importItems(query, file);
        })
      );

    readonly prepareCustomFunction = this.effect((request$: Observable<{ identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams }>) =>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ identifier, selection, params, execute, message }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          if (entityMetadata.compiledCustomScripts?.prepareCustomFunction) {
            entityMetadata.compiledCustomScripts.prepareCustomFunction(
              identifier,
              lookups,
              this.scriptUtil,
              execute,
              message,
              params,
              selection
            );
          } else {
            selection?.forEach(s => execute(s));
          }

          return of(void 0);
        })
      )
    );

    readonly evaluateCustomFunction = this.effect((request$: Observable<{ identifier: string, continueAfterSave: boolean, editUtil: EditUtil, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void }>) =>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ identifier, continueAfterSave, editUtil, param, save, message }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          if (entityMetadata.compiledCustomScripts?.evaluateCustomFunction) {
            entityMetadata.compiledCustomScripts.evaluateCustomFunction(
              identifier,
              continueAfterSave,
              editUtil,
              lookups,
              this.scriptUtil,
              param,
              save,
              message
            );
          } else {
            save(param);
          }

          return of(void 0);
        })
      )
    );

    readonly editorPreparing = ({ mode, item, layoutItem, identifier }: { mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string }) =>
      combineLatest([this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          if (layoutItem.options && entityMetadata.compiledCustomScripts?.editorPreparing) {
            entityMetadata.compiledCustomScripts?.editorPreparing(mode, item, layoutItem.options, identifier, lookups, this.scriptUtil);
          }

          return of(layoutItem);
        })
      );

    readonly editorInitialized = this.effect((request$: Observable<{ mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string }>) =>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ mode, item, editUtil, identifier }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.editorInitialized && entityMetadata.compiledCustomScripts.editorInitialized(mode, item, editUtil, identifier, lookups, this.scriptUtil));

        })
      )
    );

    readonly editorEntered = this.effect((request$: Observable<{ mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string }>)=>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ mode, item, editUtil, identifier }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.editorEntered && entityMetadata.compiledCustomScripts.editorEntered(mode, item, editUtil, identifier, lookups, this.scriptUtil));
        })
      )
    );

    readonly editorValueChanged = this.effect((request$: Observable<{ mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType }>)=>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ item, editUtil, identifier, value }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.editorValueChanged && entityMetadata.compiledCustomScripts.editorValueChanged(item, editUtil, identifier, value, lookups, this.scriptUtil));
        })
      )
    );

    readonly editorValidating = ({ item, editUtil, identifier, value, validation }: { mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string }) =>
      combineLatest([this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.editorValidating ? entityMetadata.compiledCustomScripts.editorValidating(item, editUtil, identifier, value, validation, lookups, this.scriptUtil) : true);
        })
      );

    readonly editorEvent = this.effect((request$: Observable<{ mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string }>) =>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ item, editUtil, identifier, event }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.editorEvent && entityMetadata.compiledCustomScripts.editorEvent(item, editUtil, identifier, event, lookups, this.scriptUtil));
        })
      )
    );

    readonly interactionKeyboardLine = this.effect((request$: Observable<{ mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, value: string }>)=>
      combineLatest([request$, this.entityMetadata$, this.lookupService.lookups$]).pipe(
        switchMap(([{ item, editUtil, value }, entityMetadata, lookups]) => {
          if (!entityMetadata || !lookups) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.interactionKeyboardLine && entityMetadata.compiledCustomScripts.interactionKeyboardLine(item, editUtil, value, lookups, this.scriptUtil));
        })
      )
    );

    readonly detailGridCellPreparing = ({ mode, item, detailItem, identifier, options }: { mode: EditModes, item: Record<string, unknown>, detailItem: Record<string, unknown>, identifier: string, options: GridLayoutColumn }) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata) {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          entityMetadata.compiledCustomScripts?.detailGridCellPreparing && entityMetadata.compiledCustomScripts?.detailGridCellPreparing(mode, item as CrudItem, detailItem, identifier, options, this.scriptUtil);

          return of(options);
        })
      );

    readonly detailGridRowValidating = ({ mode, item, detailItem, identifier }: { mode: EditModes, item: Record<string, unknown>, detailItem: Record<string, unknown>, identifier: string }) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata)  {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          return of(entityMetadata.compiledCustomScripts?.detailGridRowValidating ? entityMetadata.compiledCustomScripts.detailGridRowValidating(mode, item as CrudItem, detailItem, identifier, this.scriptUtil) : undefined);
        })
      );

    readonly initNewDetailItem = ({ dataMember, item, detailItem } : { dataMember: string, item: Record<string, unknown>, detailItem: Record<string, unknown> }) =>
      combineLatest([this.entityMetadata$]).pipe(
        switchMap(([entityMetadata]) => {
          if (!entityMetadata)  {
            return throwError(() => new Error('MetaService: Not initialized'));
          }

          entityMetadata.compiledCustomScripts?.initNewDetailItem && entityMetadata.compiledCustomScripts.initNewDetailItem(dataMember, item as CrudItem, detailItem, this.scriptUtil);

          return of(detailItem);
        })
      );
}
