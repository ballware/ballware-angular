import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { MetaState } from "./meta.state";
import { CompiledEntityMetadata, CrudItem, DocumentSelectEntry, EditLayout, EditLayoutItem, EditUtil, EntityCustomFunction, GridLayout, QueryParams, ValueType } from "@ballware/meta-model";
import { Observable, combineLatest, distinctUntilChanged, map, of, switchMap, tap, withLatestFrom } from "rxjs";
import { MetaApiService } from "@ballware/meta-api";
import { HttpClient } from "@angular/common/http";
import { LookupRequest, LookupService } from "../lookup.service";
import { createUtil } from "../implementation/createscriptutil";
import { cloneDeep, isEqual } from "lodash";
import { IdentityService } from "../identity.service";
import { TenantService } from "../tenant.service";
import { EditModes } from "../editmodes";
import { MetaServiceApi } from "../meta.service";

@Injectable()
export class MetaStore extends ComponentStore<MetaState> implements MetaServiceApi {
    constructor(private httpClient: HttpClient, private metaApiService: MetaApiService, private identityService: IdentityService, private tenantService: TenantService, private lookupService: LookupService) {
        super({});

        this.state$
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                console.debug('MetaStore state update');
                console.debug(state);
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
                    customFunctions: entityMetadata?.customFunctions ?? []
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

    readonly displayName$ = this.select(state => state.displayName);    
    readonly customFunctions$ = this.select(state => state.customFunctions);

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
            this.lookupService.lookups$
        ])
        .pipe(map(([customParam, entityMetadata, lookups]) => (customParam && entityMetadata && lookups) ? (identifier, mode) => {
          const editLayout = entityMetadata.editLayouts?.find(layout => layout.identifier === identifier);
  
          if (editLayout && entityMetadata.compiledCustomScripts?.prepareEditLayout) {
            const preparedEditLayout = cloneDeep(editLayout);
  
            entityMetadata.compiledCustomScripts?.prepareEditLayout(mode, lookups, customParam, createUtil(this.httpClient), preparedEditLayout);
  
            return preparedEditLayout;
          }
  
          return editLayout;
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
            entityMetadata && hasRight && currentUser &&
            (entityMetadata.compiledCustomScripts?.rightsCheck ?
                entityMetadata.compiledCustomScripts?.rightsCheck(currentUser, entityMetadata.application, entityMetadata.entity, readOnly ?? false, right, entityMetadata.compiledCustomScripts?.rightsParamForItem
                ? entityMetadata.compiledCustomScripts.rightsParamForItem(item, customParam)
                : undefined,
                hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
                : hasRight(`${entityMetadata.application}.${entityMetadata.entity}.${right}`))
            ) ?? false;
        })) as Observable<((item: CrudItem, right: string) => boolean)|undefined>;        

    readonly addAllowed$ = this.headAllowed$    
        .pipe(map((headAllowed) => headAllowed ? () => headAllowed('add') : undefined)) as Observable<(() => boolean)|undefined>;

    readonly viewAllowed$ = this.itemAllowed$        
        .pipe(map((itemAllowed) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'view') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;
    
    readonly editAllowed$ = this.itemAllowed$        
        .pipe(map((itemAllowed) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'edit') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;

    readonly dropAllowed$ = this.itemAllowed$        
        .pipe(map((itemAllowed) => itemAllowed ? (item: CrudItem) => itemAllowed(item, 'delete') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;

    readonly printAllowed$ = combineLatest([this.itemAllowed$, this.entityDocuments$])        
        .pipe(map(([itemAllowed, entityDocuments]) => (entityDocuments && entityDocuments.length > 0 && itemAllowed) ? (item: CrudItem) => itemAllowed(item, 'print') : undefined)) as Observable<((item: CrudItem) => boolean)|undefined>;
    
    readonly customFunctionAllowed$ = combineLatest([this.headAllowed$, this.itemAllowed$])
        .pipe(map(([headAllowed, itemAllowed]) => (headAllowed && itemAllowed) 
            ? (customFunction: EntityCustomFunction, item?: CrudItem) =>
                customFunction.type === 'edit' && item ? itemAllowed(item, customFunction.id) : headAllowed(customFunction.id)
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