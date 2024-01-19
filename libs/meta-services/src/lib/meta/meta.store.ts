import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { MetaApiService } from "@ballware/meta-api";
import { CompiledEntityMetadata, CrudItem, DocumentSelectEntry, EditLayout, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayout, QueryParams, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { I18NextPipe } from "angular-i18next";
import { cloneDeep, isEqual } from "lodash";
import { Observable, combineLatest, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from "rxjs";
import { metaDestroyed, metaUpdated } from "../component";
import { EditModes } from "../editmodes";
import { IdentityService } from "../identity.service";
import { createUtil } from "../implementation/createscriptutil";
import { LookupRequest, LookupService } from "../lookup.service";
import { MetaServiceApi } from "../meta.service";
import { TenantService } from "../tenant.service";
import { MetaState } from "./meta.state";

interface TemplateItemOptions {
    scope: 'tenant' | 'meta';
    identifier: string;
}

@Injectable()
export class MetaStore extends ComponentStore<MetaState> implements MetaServiceApi, OnDestroy {
    constructor(private store: Store, private httpClient: HttpClient, private i18next: I18NextPipe, private metaApiService: MetaApiService, private identityService: IdentityService, private tenantService: TenantService, private lookupService: LookupService) {
        super({});

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

        this.effect(_ => this.entity$            
            .pipe(switchMap((entity) => (entity) 
                ? this.metaApiService.metaEntityApi.metadataForEntity(entity)
                : of(undefined)))
            .pipe(tap((entityMetadata) => {                
                this.updater((state, entityMetadata: CompiledEntityMetadata|undefined) => ({
                    ...state,
                    entityMetadata,
                    displayName: entityMetadata?.displayName,
                    customFunctions: entityMetadata?.customFunctions ?? [],
                    entityTemplates: entityMetadata?.templates ?? [],
                    addFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_add') 
                        ?? { 
                            id: 'add', 
                            type: 'default_add', 
                            text: this.i18next.transform('datacontainer.actions.add', { entity: entityMetadata?.displayName }), 
                            editLayout: 'primary' 
                        },
                    viewFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_view') 
                        ?? { 
                            id: 'view', 
                            type: 'default_view', 
                            icon: 'bi bi-eye-fill',
                            text: this.i18next.transform('datacontainer.actions.show', { entity: entityMetadata?.displayName }), 
                            editLayout: 'primary' 
                        },                        
                    editFunction: entityMetadata?.customFunctions?.find(c => c.type === 'default_edit') 
                        ?? { 
                            id: 'edit', 
                            type: 'default_edit', 
                            icon: 'bi bi-pencil-fill',
                            text: this.i18next.transform('datacontainer.actions.edit', { entity: entityMetadata?.displayName }), 
                            editLayout: 'primary' 
                        },
                }))(entityMetadata);                
            }))
            .pipe(tap((entityMetadata) => {
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
            }))           
        );

        this.effect(_ => this.entity$            
            .pipe(switchMap((entity) => (entity) 
                ? this.metaApiService.metaEntityApi.documentsForEntity(entity)
                : of(undefined)))
            .pipe(tap((entityDocuments) => {                
                if (entityDocuments) {
                    this.updater((state, entityDocuments: DocumentSelectEntry[]) => ({
                        ...state,
                        entityDocuments
                    }))(entityDocuments);
                }
            }))            
        );

        this.effect(_ => combineLatest([this.entityMetadata$, this.lookupService.lookups$, this.initialCustomParam$])
            .pipe(tap(([entityMetadata, lookups, initialCustomParam]) => {
                if (lookups && entityMetadata && initialCustomParam) {
                    if (entityMetadata.compiledCustomScripts?.prepareCustomParam) {
                    entityMetadata.compiledCustomScripts.prepareCustomParam(lookups, createUtil(this.httpClient), (customParam) => {
                        this.setCustomParam(customParam);
                    });
                    } else {
                        this.setCustomParam(initialCustomParam);
                    }
                }
            })));
    }
    
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

    readonly getGridLayout$ = combineLatest([
            this.customParam$,
            this.entityMetadata$,
            this.lookupService.lookups$
        ])
        .pipe(map(([customParam, entityMetadata, lookups]) => (customParam && entityMetadata && lookups) ? (identifier) => {
          const gridLayout = entityMetadata.gridLayouts?.find(layout => layout.identifier === identifier);
  
          if (gridLayout && entityMetadata.compiledCustomScripts?.prepareGridLayout) {
            const preparedGridLayout = cloneDeep(gridLayout);
  
            entityMetadata.compiledCustomScripts?.prepareGridLayout(lookups, customParam, createUtil(this.httpClient), preparedGridLayout);
  
            return preparedGridLayout;
          }
  
          return gridLayout;
        } : undefined)) as Observable<((identifier: string) => GridLayout|undefined)|undefined>;

    readonly getEditLayout$ = combineLatest([
            this.customParam$,
            this.entityMetadata$,
            this.entityTemplates$,
            this.lookupService.lookups$,
            this.tenantService.tenantTemplates$
        ])
        .pipe(map(([customParam, entityMetadata, entityTemplates, lookups, tenantTemplates]) => (customParam && entityMetadata && entityTemplates && lookups && tenantTemplates) ? (identifier, mode) => {
            const editLayout = entityMetadata.editLayouts?.find(layout => layout.identifier === identifier);
    
            if (editLayout) {

                const preparedEditLayout = cloneDeep(editLayout);

                const materializeTemplates = (items: EditLayoutItem[]) => {
                    return items?.map(item => {
                        if ('template' === item.type) {
                            const scope = (item.options?.itemoptions as TemplateItemOptions)?.scope;
                            const identifier = (item.options?.itemoptions as TemplateItemOptions)?.identifier;

                            let template: EditLayoutItem|undefined = undefined;

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
                                    entityMetadata.compiledCustomScripts?.prepareMaterializedEditItem(mode, lookups, customParam, createUtil(this.httpClient), editLayout, scope, identifier, item);
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
                    
                    entityMetadata.compiledCustomScripts?.prepareEditLayout(mode, lookups, customParam, createUtil(this.httpClient), preparedEditLayout);
                }

                return preparedEditLayout;
            }
    
            return undefined;
        } : undefined)) as Observable<((identifier: string, mode: EditModes) => EditLayout|undefined)|undefined>;

    private readonly headAllowed$ = combineLatest([
            this.readOnly$,
            this.customParam$,
            this.identityService.currentUser$,
            this.tenantService.hasRight$,
            this.entityMetadata$
        ])
        .pipe(map(([readOnly, customParam, currentUser, hasRight, entityMetadata]) => (right: string) => {
            return (
                entityMetadata &&
                customParam &&
                currentUser &&
                !readOnly &&
                hasRight &&
                (entityMetadata.compiledCustomScripts?.rightsCheck ?
                entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly ?? false, right, entityMetadata.compiledCustomScripts?.rightsParamForHead
                    ? entityMetadata.compiledCustomScripts.rightsParamForHead(customParam)
                    : undefined,
                    hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
                : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
            ) ?? false;
        })) as Observable<((rights: string) => boolean)|undefined>;

    private readonly itemAllowed$ = combineLatest([
            this.readOnly$,
            this.customParam$,
            this.identityService.currentUser$,
            this.tenantService.hasRight$,
            this.entityMetadata$
        ])
        .pipe(map(([readOnly, customParam, currentUser, hasRight, entityMetadata]) => (item: CrudItem, right: string) => {
            return (
            entityMetadata && customParam && hasRight && currentUser &&
            (entityMetadata.compiledCustomScripts?.rightsCheck ?
                entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly ?? false, right, entityMetadata.compiledCustomScripts?.rightsParamForItem
                ? entityMetadata.compiledCustomScripts.rightsParamForItem(item, customParam)
                : undefined,
                hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
                : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
            ) ?? false;
        })) as Observable<((item: CrudItem, right: string) => boolean)|undefined>;        
    
    readonly dropAllowed$ = this.itemAllowed$        
        .pipe(map((itemAllowed) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'delete') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;

    readonly printAllowed$ = combineLatest([this.itemAllowed$, this.entityDocuments$])        
        .pipe(map(([itemAllowed, entityDocuments]) => (entityDocuments && entityDocuments.length > 0 && itemAllowed) ? (item: CrudItem) => itemAllowed(item, 'print') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;
    
    readonly customFunctionAllowed$ = combineLatest([this.headAllowed$, this.itemAllowed$])
        .pipe(map(([headAllowed, itemAllowed]) => (headAllowed && itemAllowed) 
            ? (customFunction: EntityCustomFunction, item?: CrudItem) =>
                (customFunction.type === 'default_view' || customFunction.type === 'default_edit' || customFunction.type === 'edit') && item ? itemAllowed(item, customFunction.id) : headAllowed(customFunction.id)
            : undefined)) as Observable<((customFunction: EntityCustomFunction, item?: CrudItem) => boolean)|undefined>;        

    readonly count$ = this.entityMetadata$
        .pipe(map((entityMetadata) => (entityMetadata)
            ? (query, params) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl).count(query, params)                
            : undefined)) as Observable<((query: string, params: QueryParams) => Observable<number>)|undefined>;

    readonly query$ = combineLatest([this.customParam$, this.entityMetadata$])
        .pipe(map(([customParam, entityMetadata]) => (customParam && entityMetadata)
            ? (query, params) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
                .query(query, params)
                .pipe(map((items) => entityMetadata.itemMappingScript ? items?.map(item => entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient))) : items))
            : undefined)) as Observable<((query: string, params: QueryParams) => Observable<CrudItem[]>)|undefined>;

    readonly byId$ = combineLatest([this.customParam$, this.entityMetadata$])
        .pipe(map(([customParam, entityMetadata]) => (customParam && entityMetadata)
        ? (id) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
            .byId('primary', id)
            .pipe(map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient)) : item))
        : undefined)) as Observable<((id: string) => Observable<CrudItem>)|undefined>;

    readonly create$ = combineLatest([this.customParam$, this.entityMetadata$])
        .pipe(map(([customParam, entityMetadata]) => (customParam && entityMetadata)
        ? (query, params) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
            .new(query, params)
            .pipe(map((item) => entityMetadata.itemMappingScript ? entityMetadata.itemMappingScript(item, customParam, createUtil(this.httpClient)) : item))
        : undefined)) as Observable<((query: string, params: QueryParams) => Observable<CrudItem>)|undefined>;

    readonly save$ = combineLatest([this.customParam$, this.entityMetadata$])
        .pipe(map(([customParam, entityMetadata]) => (customParam && entityMetadata)
        ? (query, item) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
            .save(query, entityMetadata.itemReverseMappingScript ? entityMetadata.itemReverseMappingScript(item, customParam, createUtil(this.httpClient)) : item)
        : undefined)) as Observable<((query: string, item: CrudItem) => Observable<void>)|undefined>;

    readonly saveBatch$ = combineLatest([this.customParam$, this.entityMetadata$])
        .pipe(map(([customParam, entityMetadata]) => (customParam && entityMetadata)
        ? (query, items) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
            .saveBatch(query, entityMetadata.itemReverseMappingScript ? items.map(item => entityMetadata.itemReverseMappingScript(item, customParam, createUtil(this.httpClient))) : items)
        : undefined)) as Observable<((query: string, items: CrudItem[]) => Observable<void>)|undefined>;     
        
    readonly drop$ = combineLatest([this.entityMetadata$])
        .pipe(map(([entityMetadata]) => (entityMetadata)
        ? (item) => this.metaApiService.metaGenericEntityApiFactory(entityMetadata.baseUrl)
            .drop(item.Id)
        : undefined)) as Observable<((item: CrudItem) => Observable<void>) | undefined>;

    readonly prepareCustomFunction$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
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
            : undefined)) as Observable<((identifier: string, selection: CrudItem[]|undefined, execute: (param: Record<string, unknown>) => void, message: (message: string) => void, params?: QueryParams) => void)|undefined>;

    readonly evaluateCustomFunction$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
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
            : undefined)) as Observable<((identifier: string, param: Record<string, unknown>, save: (param: Record<string, unknown>) => void, message: (message: string) => void) => void)|undefined>;

    readonly editorPreparing$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])            
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (mode, item, layoutItem, identifier) => layoutItem.options && entityMetadata.compiledCustomScripts?.editorPreparing && entityMetadata.compiledCustomScripts?.editorPreparing(mode, item, layoutItem.options, identifier, lookups, createUtil(this.httpClient))
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, layoutItem: EditLayoutItem, identifier: string) => void)|undefined>;
      
    readonly editorInitialized$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (mode, item, editUtil, identifier) => entityMetadata.compiledCustomScripts?.editorInitialized && entityMetadata.compiledCustomScripts.editorInitialized(mode, item, editUtil, identifier, lookups, createUtil(this.httpClient))
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
      
    readonly editorEntered$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (mode, item, editUtil, identifier) => entityMetadata.compiledCustomScripts?.editorEntered && entityMetadata.compiledCustomScripts.editorEntered(mode, item, editUtil, identifier, lookups, createUtil(this.httpClient))
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string) => void)|undefined>;
      
    readonly editorValueChanged$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (_mode, item, editUtil, identifier, value) => entityMetadata.compiledCustomScripts?.editorValueChanged && entityMetadata.compiledCustomScripts.editorValueChanged(item, editUtil, identifier, value, lookups, createUtil(this.httpClient))
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType) => void)|undefined>;
      
    readonly editorValidating$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (_mode, item, editUtil, identifier, value, validation) => entityMetadata.compiledCustomScripts?.editorValidating ? entityMetadata.compiledCustomScripts.editorValidating(item, editUtil, identifier, value, validation, lookups, createUtil(this.httpClient)) : true
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, value: ValueType, validation: string) => boolean)|undefined>;
      
    readonly editorEvent$ = combineLatest([this.entityMetadata$, this.lookupService.lookups$])
        .pipe(map(([entityMetadata, lookups]) => (entityMetadata && lookups)
            ? (_mode, item, editUtil, identifier, event) => entityMetadata.compiledCustomScripts?.editorEvent && entityMetadata.compiledCustomScripts.editorEvent(item, editUtil, identifier, event, lookups, createUtil(this.httpClient))
            : undefined)) as Observable<((mode: EditModes, item: Record<string, unknown>, editUtil: EditUtil, identifier: string, event: string) => void)|undefined>;
}