import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '@ballware/meta-api';
import { CrudItem, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, Subject, catchError, combineLatest, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { crudDestroyed, crudUpdated } from '../component';
import { CrudAction, CrudEditMenuItem, CrudServiceApi, DetailColumnEditDialog, FunctionIdentifier, ImportDialog, ItemEditDialog, ItemRemoveDialog } from '../crud.service';
import { getByPath, setByPath } from '../databinding';
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

        this.effect(_ => combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$])
            .pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
                of(customFunctions?.filter(f => f.type === 'export' && customFunctionAllowed && customFunctionAllowed(f))
                    .map(f => ({
                        id: f.id,
                        text: f.text,
                        customFunction: f
                    } as CrudEditMenuItem))
                )
            ))
            .pipe(tap((exportMenuItems) => this.updater((state, exportMenuItems: CrudEditMenuItem[]|undefined) => ({
                ...state,
                exportMenuItems
            }))(exportMenuItems))));

        this.effect(_ => combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$])
            .pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
                of(customFunctions?.filter(f => f.type === 'import' && customFunctionAllowed && customFunctionAllowed(f))
                    .map(f => ({
                        id: f.id,
                        text: f.text,
                        customFunction: f
                    } as CrudEditMenuItem))
                )
            ))
            .pipe(tap((importMenuItems) => this.updater((state, importMenuItems: CrudEditMenuItem[]|undefined) => ({
                ...state,
                importMenuItems
            }))(importMenuItems))));

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

    }
    
    readonly currentInteractionTarget$: Subject<Element | undefined> = new Subject<Element|undefined>();

    readonly reload$ = new Subject<void>();

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
    readonly importDialog$ = this.select(state => state.importDialog);
    readonly detailColumnEditDialog$ = this.select(state => state.detailColumnEditDialog);
    readonly selectAddSheet$ = this.select(state => state.selectAddSheet);
    readonly selectActionSheet$ = this.select(state => state.selectActionSheet);
    readonly selectPrintSheet$ = this.select(state => state.selectPrintSheet);
    readonly selectExportSheet$ = this.select(state => state.selectExportSheet);
    readonly selectImportSheet$ = this.select(state => state.selectImportSheet);
    
    readonly setQuery = this.updater((state, queryIdentifier: string) => ({
        ...state,
        queryIdentifier
    }));

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));
    
    readonly reload = () => {
        setTimeout(() => this.reload$.next());
    }

    readonly create = this.effect((request$: Observable<{ editLayout: string }>) => 
        request$.pipe(withLatestFrom(this.metaService.getEditLayout$, this.metaService.create$, this.metaService.displayName$, this.metaService.headParams$))
            .pipe(switchMap(([request, getEditLayout, create, displayName, headParams]) => (getEditLayout && create && displayName && headParams && request) ?
                create('primary', headParams)
                    .pipe(map((item) => ({
                        mode: EditModes.CREATE,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.add', { entity: displayName }),
                        editLayout: getEditLayout(request.editLayout, EditModes.CREATE),
                        apply: (editedItem) => { 
                            this.save({ item: editedItem as CrudItem });
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
        request$.pipe(withLatestFrom(this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$))
            .pipe(switchMap(([viewRequest, getEditLayout, byId, displayName]) => (getEditLayout && byId && displayName && viewRequest) ?
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
        request$.pipe(withLatestFrom(this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$))
            .pipe(switchMap(([editRequest, getEditLayout, byId, displayName]) => (getEditLayout && byId && displayName && editRequest) ?
                byId(editRequest.item.Id)
                    .pipe(map((item) => ({
                        mode: EditModes.EDIT,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.edit', { entity: displayName }),
                        editLayout: getEditLayout(editRequest.editLayout, EditModes.EDIT),
                        apply: (editedItem) => { 
                            this.save({ item: editedItem as CrudItem });
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

    readonly remove = this.effect((request$: Observable<{ item: CrudItem }>) => 
        request$.pipe(withLatestFrom(this.metaService.entityMetadata$, this.metaService.byId$, this.metaService.displayName$))
            .pipe(switchMap(([removeRequest, entityMetadata, byId, displayName]) => (entityMetadata && byId && displayName && removeRequest) ? 
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
        request$
            .pipe(tap((request) => this.router.navigate(['print'], {
                queryParams: {
                    docId: request.documentId,
                    id: request.items.map(item => item.Id)
                }
            })))
    );
      
    readonly customEdit = this.effect((request$: Observable<{ customFunction: EntityCustomFunction, items?: CrudItem[] | undefined }>) => 
        request$.pipe(withLatestFrom(this.metaService.prepareCustomFunction$, this.metaService.evaluateCustomFunction$, this.metaService.getEditLayout$, this.metaService.headParams$))
            .pipe(tap(([{ customFunction, items }, prepareCustomFunction, evaluateCustomFunction, getEditLayout, headParams]) =>  customFunction.entity 
                ? this.updater((state, itemDialog: ItemEditDialog) => ({
                    ...state,
                    itemDialog
                }))({
                    mode: EditModes.EDIT,
                    item: items,
                    title: customFunction.text,
                    editLayout: undefined,
                    externalEditor: false,
                    foreignEntity: customFunction.entity,
                    customFunction: customFunction,
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
                } as ItemEditDialog) 
                : prepareCustomFunction && evaluateCustomFunction && getEditLayout && prepareCustomFunction(customFunction.id, items, (params) => {
                this.updater((state, itemDialog: ItemEditDialog) => ({
                    ...state,
                    itemDialog
                }))({
                    mode: EditModes.EDIT,
                    item: params,
                    title: customFunction.text,
                    editLayout: getEditLayout(customFunction.editLayout, EditModes.EDIT),
                    externalEditor: customFunction.externalEditor,
                    foreignEntity: customFunction.entity,
                    customFunction: customFunction,
                    apply: (editedItem) => { 
                        if (!customFunction.externalEditor && !customFunction.entity) {
                            evaluateCustomFunction(customFunction.id, editedItem, 
                                (evaluatedResult) => {
                                    if (Array.isArray(evaluatedResult)) {
                                        this.saveBatch({ customFunction, items: evaluatedResult as Array<CrudItem> });
                                    } else {
                                        this.save({ customFunction, item: evaluatedResult as CrudItem });
                                    }                                
                                },
                                (message) => this.notificationService.triggerNotification({ message: this.translationService.transform(message), severity: 'warning' })
                            );
                        } else  {
                            this.updater((state) => ({
                                ...state,
                                itemDialog: undefined
                            }))(); 
                        }          
                    },
                    cancel: () => { 
                        this.updater((state) => ({
                            ...state,
                            itemDialog: undefined
                        }))(); 
                     }
                } as ItemEditDialog);
            }, (message) => this.notificationService.triggerNotification({ message: this.translationService.transform(message), severity: 'info' }), headParams))));           
            
    readonly save = this.effect((saveRequest$: Observable<{ customFunction?: EntityCustomFunction, item: CrudItem }>) => 
        saveRequest$.pipe(withLatestFrom(this.metaService.save$))
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
        saveRequest$.pipe(withLatestFrom(this.metaService.saveBatch$))
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


    readonly uploadItems = this.effect((uploadRequest$: Observable<{ query: string, file: File }>) => 
        uploadRequest$.pipe(withLatestFrom(this.metaService.importItems$))
            .pipe(switchMap(([uploadRequest, importFiles]) => (uploadRequest && importFiles)
                ? importFiles(uploadRequest.query, uploadRequest.file)
                    .pipe(tap(() => { 
                        this.notificationService.triggerNotification({ message: this.translationService.transform('editing.notifications.saved'), severity: 'info' });
                        
                        this.updater((state) => ({
                            ...state,
                            importDialog: undefined
                        }))(); 

                        this.reload();
                    }))
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                        
                        return of(undefined);              
                    }))
                : of(undefined))));

    readonly drop = this.effect((dropRequest$: Observable<{ item: CrudItem }>) => 
        dropRequest$.pipe(withLatestFrom(this.metaService.drop$))
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

    readonly importItems = this.effect((importRequest$: Observable<{ customFunction: EntityCustomFunction }>) => 
        importRequest$
            .pipe(tap((request) => this.updater((state, importDialog: ImportDialog) => ({
                ...state,
                importDialog
            }))({
                importFunction: request.customFunction,
                apply: (file) => this.uploadItems({ query: request.customFunction.id, file }),
                cancel: () => this.updater((state) => ({
                        ...state,
                        importDialog: undefined
                    }))()
             } as ImportDialog)))
    );

    readonly exportItems = this.effect((exportRequest$: Observable<{ customFunction: EntityCustomFunction, items: CrudItem[] }>) => 
        exportRequest$.pipe(withLatestFrom(this.metaService.exportItems$))
            .pipe(switchMap(([exportRequest, exportItems]) => exportItems
                ? exportItems(exportRequest.customFunction.id, exportRequest.items)
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                    
                        return of(undefined);              
                    }))   
                    .pipe(map((url) => url && window.open(url)))  
                : of(undefined)))
    );

    readonly detailColumnEdit = this.effect((request$: Observable<{ mode: EditModes, item: unknown, column: GridLayoutColumn }>) => 
        request$.pipe((withLatestFrom(this.metaService.getEditLayout$)))
            .pipe(switchMap(([request, getEditLayout]) => getEditLayout 
                ? of(request).pipe(withLatestFrom(of(getEditLayout(request.column.popuplayout ?? 'primary', request.mode))))
                : of(request).pipe(withLatestFrom(of(undefined)))))
            .pipe(tap(([request, editLayout]) => this.updater((state, detailColumnEditDialog: DetailColumnEditDialog|undefined) => ({
                ...state,
                detailColumnEditDialog
            }))((request && editLayout) ? ({
                mode: request.mode,
                item: cloneDeep(request.item),   
                title: request.column.caption,
                dataMember: request.column.dataMember,                
                editLayout: editLayout,
                apply: (item) => { 
                    if (request.column.dataMember) {
                        setByPath(request.item as Record<string, unknown>, request.column.dataMember, getByPath(item, request.column.dataMember));
                    }                    

                    this.updater((state) => ({
                        ...state,
                        detailColumnEditDialog: undefined
                    }))(); 
                 },
                 cancel: () => { 
                    this.updater((state) => ({
                        ...state,
                        detailColumnEditDialog: undefined
                    }))(); 
                 }             
            } as DetailColumnEditDialog) : undefined)))
    );

    readonly selectAdd = this.effect((selectAddRequest$: Observable<{ target: Element, defaultEditLayout: string }>) => 
        selectAddRequest$.pipe(withLatestFrom(this.addMenuItems$))            
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
                                execute: (_target) => (f.customFunction && f.customFunction.id !== 'add')
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
        selectPrintRequest$
            .pipe(withLatestFrom(this.metaService.entityDocuments$, this.metaService.printAllowed$))
            .pipe(map(([selectPrintRequest, entityDocuments, printAllowed]) => {
                if (entityDocuments && selectPrintRequest && printAllowed) {

                    if (selectPrintRequest?.items.filter(item => !printAllowed(item)).length) {
                        this.notificationService.triggerNotification({ message: this.translationService.transform('editing.notifications.notallowed'), severity: 'info' });
                        
                        return undefined;
                    }

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

    readonly selectExport = this.effect((selectExportRequest$: Observable<{ items: CrudItem[], target: Element }>) => 
        selectExportRequest$.pipe(withLatestFrom(this.exportMenuItems$))
            .pipe(map(([selectExportRequest, exportMenuItems]) => {
                if (exportMenuItems && selectExportRequest) {

                    this.currentInteractionTarget$.next(selectExportRequest.target);

                    return {
                        items: selectExportRequest.items,
                        actions: exportMenuItems.map(f => ({ 
                            id: f.id, 
                            icon: f.icon, 
                            text: f.text, 
                            execute: (_target) => f.customFunction && this.exportItems({ customFunction: f.customFunction, items: selectExportRequest.items })
                        } as CrudAction))
                    };
                }

                return undefined;
            }))
            .pipe(tap((selectExportSheet) => this.updater((state, selectExportSheet: { items: CrudItem[], actions: CrudAction[]}|undefined) => ({
                    ...state,
                    selectExportSheet
                }))(selectExportSheet)
            ))
    );

    readonly selectImport = this.effect((selectImportRequest$: Observable<{ target: Element }>) => 
        selectImportRequest$.pipe(withLatestFrom(this.importMenuItems$))
            .pipe(map(([selectImportRequest, importMenuItems]) => {
                if (importMenuItems && selectImportRequest) {

                    this.currentInteractionTarget$.next(selectImportRequest.target);

                    return {
                        actions: importMenuItems.map(f => ({ 
                            id: f.id, 
                            icon: f.icon, 
                            text: f.text, 
                            execute: (_target) => f.customFunction && this.importItems({ customFunction: f.customFunction })
                        } as CrudAction))
                    };
                }

                return undefined;
            }))
            .pipe(tap((selectImportSheet) => this.updater((state, selectImportSheet: { actions: CrudAction[]}|undefined) => ({
                    ...state,
                    selectImportSheet
                }))(selectImportSheet)
            ))
    );

    readonly selectOptions = this.effect((request$: Observable<{ item: CrudItem, target: Element, defaultEditLayout: string }>) => 
        request$.pipe(withLatestFrom(            
                this.metaService.customFunctions$, 
                this.metaService.customFunctionAllowed$
            )).pipe(switchMap(([{ item }, customFunctions, customFunctionAllowed]) => 
                of(customFunctions?.filter(f => f.type === 'edit' && customFunctionAllowed && customFunctionAllowed(f, item))
                    .map(f => ({ 
                        id: f.id, 
                        icon: f.icon, 
                        text: f.text, 
                        execute: (_target) => this.customEdit({ customFunction: f, items: [item]})
                    } as CrudAction)))
            )).pipe(withLatestFrom(
                request$,
                this.metaService.viewFunction$,
                this.metaService.editFunction$,
                this.metaService.customFunctionAllowed$,
                this.metaService.dropAllowed$,
                this.metaService.printAllowed$            
            ))
            .pipe(map(([customFunctions, { item, target, defaultEditLayout }, viewFunction, editFunction, customFunctionAllowed, dropAllowed, printAllowed]) => {

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
        request$.pipe(withLatestFrom(
                this.metaService.customFunctions$, 
                this.metaService.customFunctionAllowed$
            ))
            .pipe(switchMap(([{ item }, customFunctions, customFunctionAllowed]) => 
                of(customFunctions?.filter(f => f.type === 'edit' && customFunctionAllowed && customFunctionAllowed(f, item))
                    .map(f => ({ 
                        id: f.id, 
                        icon: f.icon, 
                        text: f.text, 
                        execute: (_target) => this.customEdit({ customFunction: f, items: [item]})
                    } as CrudAction)))
            ))
            .pipe(withLatestFrom(request$))
            .pipe(map(([customFunctions, { item, target }]) => {

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
        }))(selectActionSheet)))
    );
    
    readonly selectAddDone = this.updater((state) => ({
        ...state,
        selectAddSheet: undefined
    }));

    readonly selectPrintDone = this.updater((state) => ({
        ...state,
        selectPrintSheet: undefined
    }));

    readonly selectExportDone = this.updater((state) => ({
        ...state,
        selectExportSheet: undefined
    }));

    readonly selectImportDone = this.updater((state) => ({
        ...state,
        selectImportSheet: undefined
    }));

    readonly selectOptionsDone = this.updater((state) => ({
        ...state,
        selectActionSheet: undefined
    }));
}