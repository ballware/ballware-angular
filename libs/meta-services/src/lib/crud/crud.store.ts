import { ComponentStore } from '@ngrx/component-store';
import { CrudState } from "./crud.state";
import { CrudAction, CrudEditMenuItem, CrudServiceApi, FunctionIdentifier, ItemEditDialog, ItemRemoveDialog } from '../crud.service';
import { CrudItem, EntityCustomFunction } from '@ballware/meta-model';
import { Observable, combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MetaService } from '../meta.service';
import { isEqual } from 'lodash';
import { EditModes } from '../editmodes';
import { I18NextPipe } from 'angular-i18next';

export class CrudStore extends ComponentStore<CrudState> implements CrudServiceApi {
    constructor(private metaService: MetaService, private translationService: I18NextPipe) {
        super({});

        this.state$
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                console.debug('CrudStore state update');
                console.debug(state);
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
                this.metaService.addAllowed$,
                this.metaService.displayName$
            ])
            .pipe(map(([customFunctions, addAllowed, displayName]) => (addAllowed && addAllowed() ? [{
                id: 'none',
                text: this.translationService.transform('datacontainer.actions.add', { entity: displayName })
            } as CrudEditMenuItem, ...customFunctions ?? []] : customFunctions)))
            .pipe(tap((addMenuItems) => this.updater((state, addMenuItems: CrudEditMenuItem[]|undefined) => ({
                ...state,
                addMenuItems
            }))(addMenuItems)))
        );
    }

    readonly functionAllowed$ = combineLatest(([
            this.metaService.addAllowed$,
            this.metaService.viewAllowed$,
            this.metaService.editAllowed$,
            this.metaService.dropAllowed$,
            this.metaService.printAllowed$,
            this.metaService.customFunctions$,
            this.metaService.customFunctionAllowed$
        ])).pipe(map(([addAllowed, viewAllowed, editAllowed, dropAllowed, printAllowed, customFunctions, customFunctionAllowed]) => (identifier: FunctionIdentifier, data: CrudItem) => {
            switch (identifier) {
            case 'add':
                return (addAllowed && addAllowed()) ?? false;
            case 'view':
                return (data && viewAllowed && viewAllowed(data)) ?? false;
            case 'edit':
                return (data && editAllowed && editAllowed(data)) ?? false;
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
    
    readonly functionExecute$ = of((identifier: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => {
            switch (identifier) {
                case 'add':
                    break;
                case 'view':
                    this.view({ item: data, editLayout: editLayoutIdentifier });
                    break;
                case 'edit':
                    this.edit({ item: data, editLayout: editLayoutIdentifier });
                    break;
                case 'delete':
                    this.remove({ item: data });
                    break;
                case 'print':
                    this.selectPrint({ item: data, target });
                    break;
                case 'options':
                    this.selectOptions(data, target, editLayoutIdentifier);
                    break;
                case 'customoptions':
                    this.selectCustomOptions(data, target, editLayoutIdentifier);
                    break;
            }
        });

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

    readonly setStorageIdentifier = this.updater((state, storageIdentifier: string) => ({
        ...state,
        storageIdentifier
    }));
    
    readonly reload = this.effect(_ => 
        combineLatest([this.queryIdentifier$, this.metaService.query$, this.metaService.headParams$])            
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

    readonly create = this.effect((editLayoutIdentifier$: Observable<string>) => 
        combineLatest([this.metaService.getEditLayout$, this.metaService.create$, this.metaService.displayName$, this.metaService.headParams$, editLayoutIdentifier$])
            .pipe(switchMap(([getEditLayout, create, displayName, headParams, editLayoutIdentifier]) => (getEditLayout && create && displayName && headParams && editLayoutIdentifier) ?
                create('primary', headParams)
                    .pipe(map((item) => ({
                        mode: EditModes.CREATE,
                        item: item,
                        title: this.translationService.transform('datacontainer.titles.add', { entity: displayName }),
                        editLayout: getEditLayout(editLayoutIdentifier, EditModes.CREATE),
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

    readonly remove = this.effect(($request: Observable<{ item: CrudItem }>) => 
        combineLatest([this.metaService.entityMetadata$, this.metaService.byId$, this.metaService.displayName$, $request])            
            .pipe(switchMap(([entityMetadata, byId, displayName, removeRequest]) => (entityMetadata && byId && displayName && removeRequest) ? 
                byId(removeRequest.item.Id)
                    .pipe(map((item) => 
                        ({
                            item: item,
                            title: this.translationService.transform('datacontainer.titles.remove', { entity: displayName }),
                            apply: () => { 
                                this.updater((state) => ({
                                    ...state,
                                    removeDialog: undefined
                                }))(); 
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

    print(documentId: string, items: CrudItem[]): void {
        throw new Error('Method not implemented.');
    }

    customEdit(customFunction: EntityCustomFunction, items?: CrudItem[] | undefined): void {
        throw new Error('Method not implemented.');
    }

    readonly selectAdd = this.effect((selectAddRequest$: Observable<{ target: Element, defaultEditLayout: string }>) => 
        combineLatest([selectAddRequest$, this.addMenuItems$])            
            .pipe(map(([selectAddRequest, addMenuItems]) => {
                if (selectAddRequest && addMenuItems) {
                    if (addMenuItems.length === 1) {
                        if (addMenuItems[0].customFunction) {
                            this.customEdit(addMenuItems[0].customFunction);
                        } else {
                            this.create(selectAddRequest.defaultEditLayout);
                        }

                        return undefined;
                    } else if (addMenuItems.length > 1) {
                        return {
                            target: selectAddRequest.target,
                            actions: addMenuItems.map(f => ({
                                id: f.id,
                                text: f.text,
                                icon: f.customFunction?.icon ?? 'bi bi-plus',
                                target: selectAddRequest.target,
                                execute: (target) => f.customFunction ? this.customEdit(f.customFunction) : this.create(selectAddRequest.defaultEditLayout)
                            } as CrudAction))
                        };
                    }
                }

                return undefined;
            }))
            .pipe(tap((selectAddSheet) => this.updater((state, selectAddSheet: { target: Element, actions: CrudAction[]}|undefined) => ({
                ...state,
                selectAddSheet
            }))(selectAddSheet)))
    );

    selectPrint = this.effect((selectPrintRequest$: Observable<{ item: CrudItem, target: Element }>) => 
        combineLatest([this.metaService.entityDocuments$, selectPrintRequest$])
            .pipe(map(([entityDocuments, selectPrintRequest]) => {
                if (entityDocuments && selectPrintRequest) {
                    return {
                        item: selectPrintRequest.item,
                        target: selectPrintRequest.target,
                        actions: entityDocuments.map(d => ({
                            id: d.Id,
                            text: d.Name,
                            icon: 'bi bi-file-earmark-fill',
                            item: selectPrintRequest.item,
                            target: selectPrintRequest.target,
                            execute: (_target) => this.print(d.Id, [selectPrintRequest.item])
                        } as CrudAction))
                    };
                }

                return undefined;
            }))
            .pipe(tap((selectPrintSheet) => this.updater((state, selectPrintSheet: { item: CrudItem, target: Element, actions: CrudAction[]}|undefined) => ({
                    ...state,
                    selectPrintSheet
                }))(selectPrintSheet)
            ))
    )

    selectOptions(item: CrudItem, target: Element, defaultEditLayout: string): void {
        throw new Error('Method not implemented.');
    }

    selectCustomOptions(item: CrudItem, target: Element, defaultEditLayout: string): void {
        throw new Error('Method not implemented.');
    }


}