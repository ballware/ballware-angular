import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '@ballware/meta-api';
import { CrudItem, EntityCustomFunction } from '@ballware/meta-model';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, Subject, catchError, combineLatest, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { crudDestroyed, crudUpdated } from '../component';
import { CrudAction, CrudEditMenuItem, CrudServiceApi, FunctionIdentifier, ItemEditDialog, ItemRemoveDialog } from '../crud.service';
import { EditModes } from '../editmodes';
import { MetaService } from '../meta.service';
import { NotificationService } from '../notification.service';
import { CrudState } from "./crud.state";

export class CrudStore extends ComponentStore<CrudState> implements CrudServiceApi, OnDestroy {
    
    constructor(private store: Store, private metaService: MetaService, private notificationService: NotificationService, private translationService: I18NextPipe, private router: Router) {
        super({});

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {                
                if (state.identifier) {
                    this.store.dispatch(crudUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Crud state update');
                    console.debug(state);    
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(crudDestroyed({ identifier: state.identifier }));
                }
            });

        this.effect(_ => combineLatest([ 
            combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$])
                .pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
                    of(customFunctions?.filter(f => f.type === 'add' && customFunctionAllowed && customFunctionAllowed(f))
                        .map(f => ({
                            id: f.id,
                            text: f.text,
                            customFunction: f
                        } as CrudEditMenuItem))
                    )
                )),
                this.metaService.addFunction$,
                this.metaService.customFunctionAllowed$
            ])
            .pipe(map(([customFunctions, addFunction, customFunctionAllowed]) => (addFunction && customFunctionAllowed && customFunctionAllowed(addFunction) ? [{
                id: addFunction.id,
                text: addFunction.text,
                customFunction: addFunction.id !== 'none' ? addFunction : undefined
            } as CrudEditMenuItem, ...customFunctions ?? []] : customFunctions)))
            .pipe(tap((addMenuItems) => this.updater((state, addMenuItems: CrudEditMenuItem[]|undefined) => ({
                ...state,
                addMenuItems
            }))(addMenuItems)))
        );

        this.effect(_ => 
            combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$])
                .pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
                    of(customFunctions?.filter(f => f.multi && f.type === 'edit' && customFunctionAllowed && customFunctionAllowed(f))
                        .map(f => ({
                            id: f.id,                            
                            type: 'edit',
                            icon: f.icon,
                            text: f.text,
                            editLayout: f.editLayout,
                            customFunction: f
                        } as EntityCustomFunction))
                    )
                ))
                .pipe(tap((headCustomFunctions) => this.updater((state, headCustomFunctions: EntityCustomFunction[]|undefined) => ({
                    ...state,
                    headCustomFunctions
                }))(headCustomFunctions)))
        );        

        this.effect(_ => combineLatest([this.queryIdentifier$, this.metaService.query$, this.metaService.headParams$])
            .pipe(switchMap(([queryIdentifier, query, fetchParams]) => {
                if (queryIdentifier && fetchParams && query) {
                    return query(queryIdentifier, fetchParams);
                }                        
                else {
                    return of(undefined);
                }
            }))
            .pipe(tap((fetchedItems) =>
                this.updater((state, fetchedItems: CrudItem[]|undefined) => ({
                    ...state,
                    fetchedItems
                }))(fetchedItems)
            ))
        );
    }

    readonly currentInteractionTarget$: Subject<Element | undefined> = new Subject<Element|undefined>();

    readonly functionAllowed$ = combineLatest(([
            this.metaService.addFunction$,
            this.metaService.viewFunction$,
            this.metaService.editFunction$,
            this.metaService.dropAllowed$,
            this.metaService.printAllowed$,
            this.metaService.customFunctions$,
            this.metaService.customFunctionAllowed$
        ])).pipe(map(([addFunction, viewFunction, editFunction, dropAllowed, printAllowed, customFunctions, customFunctionAllowed]) => (identifier: FunctionIdentifier, data: CrudItem) => {
            switch (identifier) {
            case 'add':
                return (addFunction && customFunctionAllowed && customFunctionAllowed(addFunction)) ?? false;
            case 'view':
                return (data && viewFunction && customFunctionAllowed && customFunctionAllowed(viewFunction, data)) ?? false;
            case 'edit':
                return (data && editFunction && customFunctionAllowed && customFunctionAllowed(editFunction, data)) ?? false;
            case 'delete':
                return (data && dropAllowed && dropAllowed(data)) ?? false;
            case 'print':
                return (data && printAllowed && printAllowed(data)) ?? false;
            case 'options':
                return true;
            case 'customoptions': {
                if (data && customFunctions && customFunctionAllowed) {
                    const allowedAdditionalFunctions = customFunctions?.filter(f =>
                        customFunctionAllowed(f, data)
                    );
        
                    return allowedAdditionalFunctions?.length > 0;
                }
    
                return false;
            }
            default:
                return false;
            }
        }));
    
    readonly functionExecute$ = combineLatest([this.metaService.viewFunction$, this.metaService.editFunction$])
        .pipe(map(([viewFunction, editFunction]) => (viewFunction && editFunction) ? (identifier: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => {
            switch (identifier) {
                case 'add':
                    break;
                case 'view':
                    if (viewFunction.id !== 'view') {
                        this.customEdit({ customFunction: viewFunction, items: [data]});
                    } else {
                        this.view({ item: data, editLayout: editLayoutIdentifier });
                    }           
                    break;
                case 'edit':
                    if (editFunction.id !== 'edit') {
                        this.customEdit({ customFunction: editFunction, items: [data]});
                    } else {
                        this.edit({ item: data, editLayout: editLayoutIdentifier });
                    }                    
                    break;
                case 'delete':
                    this.remove({ item: data });
                    break;
                case 'print':
                    this.selectPrint({ items: [data], target });
                    break;
                case 'options':
                    this.selectOptions({ item: data, target, defaultEditLayout: editLayoutIdentifier });
                    break;
                case 'customoptions':
                    this.selectCustomOptions({ item: data, target, defaultEditLayout: editLayoutIdentifier });
                    break;
            }
        } : undefined));

    readonly queryIdentifier$ = this.select(state => state.queryIdentifier);
    readonly addMenuItems$ = this.select(state => state.addMenuItems);
    readonly headCustomFunctions$ = this.select(state => state.headCustomFunctions);
    readonly exportMenuItems$ = this.select(state => state.exportMenuItems);
    readonly importMenuItems$ = this.select(state => state.importMenuItems);
    readonly itemDialog$ = this.select(state => state.itemDialog);
    readonly removeDialog$ = this.select(state => state.removeDialog);
    readonly selectAddSheet$ = this.select(state => state.selectAddSheet);
    readonly selectActionSheet$ = this.select(state => state.selectActionSheet);
    readonly selectPrintSheet$ = this.select(state => state.selectPrintSheet);
    readonly fetchedItems$ = this.select(state => state.fetchedItems);

    readonly setQuery = this.updater((state, queryIdentifier: string) => ({
        ...state,
        queryIdentifier
    }));

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));
    
    readonly reload = this.effect<void>((trigger$) => 
        trigger$.pipe(withLatestFrom(this.queryIdentifier$, this.metaService.query$, this.metaService.headParams$))        
            .pipe(switchMap(([, queryIdentifier, query, fetchParams]) => {
                if (queryIdentifier && fetchParams && query) {
                    return query(queryIdentifier, fetchParams);
                }                        
                else {
                    return of(undefined);
                }
            }))
            .pipe(tap((fetchedItems) =>
                this.updater((state, fetchedItems: CrudItem[]|undefined) => ({
                    ...state,
                    fetchedItems
                }))(fetchedItems)
            ))
    );

    readonly create = this.effect((request$: Observable<{ editLayout: string }>) => 
        combineLatest([this.metaService.getEditLayout$, this.metaService.create$, this.metaService.displayName$, this.metaService.headParams$, request$])
            .pipe(switchMap(([getEditLayout, create, displayName, headParams, request]) => (getEditLayout && create && displayName && headParams && request) ?
                create('primary', headParams)
                    .pipe(map((item) => ({
                        mode: EditModes.CREATE,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.add', { entity: displayName }),
                        editLayout: getEditLayout(request.editLayout, EditModes.CREATE),
                        apply: () => { 
                            this.save({ item });
                        },
                        cancel: () => { 
                            this.updater((state) => ({
                                ...state,
                                itemDialog: undefined
                            }))();
                         }
                    } as ItemEditDialog)))
                : of(undefined)))
            .pipe(tap((itemDialog) => {                
                this.updater((state, itemDialog: ItemEditDialog|undefined) => ({
                    ...state,
                    itemDialog
                }))(itemDialog);
            }))
    );

    readonly view = this.effect((request$: Observable<{ item: CrudItem, editLayout: string }>) => 
        combineLatest([this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$, request$])
            .pipe(switchMap(([getEditLayout, byId, displayName, viewRequest]) => (getEditLayout && byId && displayName && viewRequest) ?
                byId(viewRequest.item.Id)
                    .pipe(map((item) => ({
                        mode: EditModes.VIEW,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.view', { entity: displayName }),
                        editLayout: getEditLayout(viewRequest.editLayout, EditModes.VIEW),
                        apply: () => { 
                            this.updater((state) => ({
                                ...state,
                                itemDialog: undefined
                            }))(); 
                        },
                        cancel: () => { 
                            this.updater((state) => ({
                                ...state,
                                itemDialog: undefined
                            }))(); 
                         }
                    } as ItemEditDialog)))
                : of(undefined)))
            .pipe(tap((itemDialog) => {                
                this.updater((state, itemDialog: ItemEditDialog|undefined) => ({
                    ...state,
                    itemDialog
                }))(itemDialog);
            }))
    );

    readonly edit = this.effect((request$: Observable<{ item: CrudItem, editLayout: string }>) => 
        combineLatest([this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$, request$])
            .pipe(switchMap(([getEditLayout, byId, displayName, editRequest]) => (getEditLayout && byId && displayName && editRequest) ?
                byId(editRequest.item.Id)
                    .pipe(map((item) => ({
                        mode: EditModes.EDIT,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.edit', { entity: displayName }),
                        editLayout: getEditLayout(editRequest.editLayout, EditModes.EDIT),
                        apply: () => { 
                            this.save({ item });
                        },
                        cancel: () => { 
                            this.updater((state) => ({
                                ...state,
                                itemDialog: undefined
                            }))(); 
                         }
                    } as ItemEditDialog)))
                : of(undefined)))
            .pipe(tap((itemDialog) => {                
                this.updater((state, itemDialog: ItemEditDialog|undefined) => ({
                    ...state,
                    itemDialog
                }))(itemDialog);
            }))
    );

    readonly remove = this.effect(($request: Observable<{ item: CrudItem }>) => 
        combineLatest([this.metaService.entityMetadata$, this.metaService.byId$, this.metaService.displayName$, $request])            
            .pipe(switchMap(([entityMetadata, byId, displayName, removeRequest]) => (entityMetadata && byId && displayName && removeRequest) ? 
                byId(removeRequest.item.Id)
                    .pipe(map((item) => 
                        ({
                            item: item,
                            title: this.translationService.transform('datacontainer.titles.remove', { entity: displayName }),
                            apply: () => { 
                                this.drop({ item });
                            },
                            cancel: () => { 
                                this.updater((state) => ({
                                    ...state,
                                    removeDialog: undefined
                                }))(); 
                            }
                        } as ItemRemoveDialog))) : of(undefined)))
            .pipe(tap((removeDialog) => this.updater((state, removeDialog: ItemRemoveDialog|undefined) => ({
                ...state,
                removeDialog
            }))(removeDialog)))
    );

    readonly print = this.effect((request$: Observable<{ documentId: string, items: CrudItem[] }>) => 
        combineLatest([request$])
            .pipe(tap(([request]) => this.router.navigate(['print'], {
                queryParams: {
                    docId: request.documentId,
                    id: request.items.map(item => item.Id)
                }
            })))
    );
      
    readonly customEdit = this.effect((request$: Observable<{ customFunction: EntityCustomFunction, items?: CrudItem[] | undefined }>) => 
        combineLatest([request$, this.metaService.prepareCustomFunction$, this.metaService.evaluateCustomFunction$, this.metaService.getEditLayout$])
            .pipe(tap(([{ customFunction, items }, prepareCustomFunction, evaluateCustomFunction, getEditLayout]) => prepareCustomFunction && evaluateCustomFunction && getEditLayout && prepareCustomFunction(customFunction.id, items, (params) => {
                this.updater((state, itemDialog: ItemEditDialog) => ({
                    ...state,
                    itemDialog
                }))({
                    mode: EditModes.EDIT,
                    item: params,
                    title: customFunction.text,
                    editLayout: getEditLayout(customFunction.editLayout, EditModes.EDIT),
                    externalEditor: customFunction.externalEditor,
                    apply: () => { 
                        evaluateCustomFunction(customFunction.id, params, 
                            (evaluatedResult) => {
                                if (Array.isArray(evaluatedResult)) {
                                    this.saveBatch({ customFunction, items: evaluatedResult as Array<CrudItem> });
                                } else {
                                    this.save({ customFunction, item: evaluatedResult as CrudItem });
                                }                                
                            },
                            (message) => this.notificationService.triggerNotification({ message: this.translationService.transform(message), severity: 'warning' })
                        );

                        this.updater((state) => ({
                            ...state,
                            itemDialog: undefined
                        }))(); 
                    },
                    cancel: () => { 
                        this.updater((state) => ({
                            ...state,
                            itemDialog: undefined
                        }))(); 
                     }
                } as ItemEditDialog);
            }, (message) => console.log(message)))));           
            
    readonly save = this.effect((saveRequest$: Observable<{ customFunction?: EntityCustomFunction, item: CrudItem }>) => 
        combineLatest([saveRequest$, this.metaService.save$])
            .pipe(switchMap(([saveRequest, save]) => (saveRequest && save)
                ? save(saveRequest.customFunction?.id ?? 'primary', saveRequest.item)
                    .pipe(tap(() => { 
                        this.notificationService.triggerNotification({ message: this.translationService.transform('editing.notifications.saved'), severity: 'info' });
                        
                        this.updater((state) => ({
                            ...state,
                            itemDialog: undefined
                        }))(); 

                        this.reload();
                    }))
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                        
                        return of(undefined);              
                    }))
                : of(undefined)
            )));

    readonly saveBatch = this.effect((saveRequest$: Observable<{ customFunction: EntityCustomFunction, items: CrudItem[] }>) => 
        combineLatest([saveRequest$, this.metaService.saveBatch$])
            .pipe(switchMap(([saveRequest, saveBatch]) => (saveRequest && saveBatch)
                ? saveBatch(saveRequest.customFunction?.id ?? 'primary', saveRequest.items)
                    .pipe(tap(() => { 
                        this.notificationService.triggerNotification({ message: this.translationService.transform('editing.notifications.saved'), severity: 'info' });
                        
                        this.updater((state) => ({
                            ...state,
                            itemDialog: undefined
                        }))(); 

                        this.reload();
                    }))
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                        
                        return of(undefined);              
                    }))
                : of(undefined)
            )));

    readonly drop = this.effect((dropRequest$: Observable<{ item: CrudItem }>) => 
        combineLatest([dropRequest$, this.metaService.drop$])
            .pipe(switchMap(([dropRequest, drop]) => (dropRequest && drop)
                ? drop(dropRequest.item)
                    .pipe(tap(() => { 
                        this.notificationService.triggerNotification({ message: this.translationService.transform('editing.notifications.removed'), severity: 'info' });
                        
                        this.updater((state) => ({
                            ...state,
                            removeDialog: undefined
                        }))(); 

                        this.reload();
                    }))
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                        
                        return of(undefined);              
                    }))
                : of(undefined)
            ))
    );

    readonly selectAdd = this.effect((selectAddRequest$: Observable<{ target: Element, defaultEditLayout: string }>) => 
        combineLatest([selectAddRequest$, this.addMenuItems$])            
            .pipe(map(([selectAddRequest, addMenuItems]) => {
                if (selectAddRequest && addMenuItems) {
                    if (addMenuItems.length === 1) {
                        if (addMenuItems[0].customFunction && addMenuItems[0].customFunction.id !== 'add') {
                            this.customEdit({ customFunction: addMenuItems[0].customFunction });
                        } else {
                            this.create({ editLayout: selectAddRequest.defaultEditLayout });
                        }

                        return undefined;
                    } else if (addMenuItems.length > 1) {

                        this.currentInteractionTarget$.next(selectAddRequest.target)

                        return {
                            actions: addMenuItems.map(f => ({
                                id: f.id,
                                text: f.text,
                                icon: f.customFunction?.icon ?? 'bi bi-plus',
                                execute: (_target) => f.customFunction 
                                    ? this.customEdit({ customFunction: f.customFunction }) 
                                    : this.create({ editLayout: selectAddRequest.defaultEditLayout })
                            } as CrudAction))
                        };
                    }
                }

                return undefined;
            }))
            .pipe(tap((selectAddSheet) => this.updater((state, selectAddSheet: { actions: CrudAction[]}|undefined) => ({
                ...state,
                selectAddSheet
            }))(selectAddSheet)))
    );

    readonly selectPrint = this.effect((selectPrintRequest$: Observable<{ items: CrudItem[], target: Element }>) => 
        combineLatest([this.metaService.entityDocuments$, selectPrintRequest$])
            .pipe(map(([entityDocuments, selectPrintRequest]) => {
                if (entityDocuments && selectPrintRequest) {

                    this.currentInteractionTarget$.next(selectPrintRequest.target);

                    return {
                        items: selectPrintRequest.items,
                        actions: entityDocuments.map(d => ({
                            id: d.Id,
                            text: d.Name,
                            icon: 'bi bi-file-earmark-fill',
                            execute: (_target) => this.print({ documentId: d.Id, items: selectPrintRequest.items })
                        } as CrudAction))
                    };
                }

                return undefined;
            }))
            .pipe(tap((selectPrintSheet) => this.updater((state, selectPrintSheet: { items: CrudItem[], actions: CrudAction[]}|undefined) => ({
                    ...state,
                    selectPrintSheet
                }))(selectPrintSheet)
            ))
    );

    readonly selectOptions = this.effect((request$: Observable<{ item: CrudItem, target: Element, defaultEditLayout: string }>) => 
        combineLatest([
            request$,            
            combineLatest([
                request$,
                this.metaService.customFunctions$, 
                this.metaService.customFunctionAllowed$
            ]).pipe(switchMap(([{ item }, customFunctions, customFunctionAllowed]) => 
                of(customFunctions?.filter(f => f.type === 'edit' && customFunctionAllowed && customFunctionAllowed(f, item))
                    .map(f => ({ 
                        id: f.id, 
                        icon: f.icon, 
                        text: f.text, 
                        execute: (_target) => this.customEdit({ customFunction: f, items: [item]})
                    } as CrudAction)))
            )),
            this.metaService.viewFunction$,
            this.metaService.editFunction$,
            this.metaService.customFunctionAllowed$,
            this.metaService.dropAllowed$,
            this.metaService.printAllowed$            
        ])
        .pipe(map(([{ item, target, defaultEditLayout }, customFunctions, viewFunction, editFunction, customFunctionAllowed, dropAllowed, printAllowed]) => {

            const actions = [] as CrudAction[];

            if (viewFunction && customFunctionAllowed && customFunctionAllowed(viewFunction, item)) {
                actions.push({
                    id: 'view',
                    icon: viewFunction.icon ?? 'bi bi-eye-fill',
                    text: viewFunction.text,
                    execute: (_target) => viewFunction.id === 'view' 
                        ? this.view({ item, editLayout: defaultEditLayout }) 
                        : this.customEdit({ customFunction: viewFunction, items: [item]})
                });
            }

            if (editFunction && customFunctionAllowed && customFunctionAllowed(editFunction, item)) {
                actions.push({
                    id: 'edit',                  
                    icon: editFunction.icon ?? 'bi bi-pencil-fill',
                    text: editFunction.text,
                    execute: (_target) => editFunction.id === 'edit' 
                        ? this.edit({ item, editLayout: defaultEditLayout })
                        : this.customEdit({ customFunction: editFunction, items: [item]})
                });
              }

            if (dropAllowed && dropAllowed(item)) {
                actions.push({
                    id: 'delete',                  
                    icon: 'bi bi-trash-fill',
                    text: this.translationService.transform('datacontainer.actions.remove'),
                    execute: (_target) => this.remove({ item })
                });
            }              

            if (printAllowed && printAllowed(item)) {
                actions.push({
                    id: 'print',                    
                    icon: 'bi bi-printer-fill',
                    text: this.translationService.transform('datacontainer.actions.print'),
                    execute: (target) => this.selectPrint({ items: [item], target })
                });
            }

            if (customFunctions) {
                actions.push(...customFunctions);
            }

            this.currentInteractionTarget$.next(target);

            return {
                item,
                actions
            };
        }))
        .pipe(tap((selectActionSheet) => this.updater((state, selectActionSheet: { item: CrudItem, actions: CrudAction[]}|undefined) => ({
            ...state,
            selectActionSheet
        }))(selectActionSheet))))
    ;


    readonly selectCustomOptions = this.effect((request$: Observable<{ item: CrudItem, target: Element, defaultEditLayout: string }>) => 
        combineLatest([
            request$,
            combineLatest([
                request$,
                this.metaService.customFunctions$, 
                this.metaService.customFunctionAllowed$
            ]).pipe(switchMap(([{ item }, customFunctions, customFunctionAllowed]) => 
                of(customFunctions?.filter(f => f.type === 'edit' && customFunctionAllowed && customFunctionAllowed(f, item))
                    .map(f => ({ 
                        id: f.id, 
                        icon: f.icon, 
                        text: f.text, 
                        execute: (_target) => this.customEdit({ customFunction: f, items: [item]})
                    } as CrudAction)))
            ))          
        ])
        .pipe(map(([{ item, target }, customFunctions]) => {

            const actions = [] as CrudAction[];

            if (customFunctions) {
                actions.push(...customFunctions);
            }

            this.currentInteractionTarget$.next(target);

            return {
                item,
                actions
            };
        }))
        .pipe(tap((selectActionSheet) => this.updater((state, selectActionSheet: { item: CrudItem, actions: CrudAction[]}|undefined) => ({
            ...state,
            selectActionSheet
        }))(selectActionSheet))))
    ;          
}