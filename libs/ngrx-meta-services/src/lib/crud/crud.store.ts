import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '@ballware/meta-api';
import { CrudItem, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { cloneDeep, isEqual, get, set } from 'lodash';
import {
  Observable,
  Subject,
  catchError,
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
import { crudDestroyed, crudUpdated } from '../component';
import { CrudAction, CrudEditMenuItem, CrudService, DetailColumnEditDialog, EditModes, FunctionIdentifier, ImportDialog, ItemEditDialog, ItemRemoveDialog, MetaService, NotificationService, Translator } from '@ballware/meta-services';
import { CrudState } from "./crud.state";

export class CrudStore extends ComponentStore<CrudState> implements CrudService, OnDestroy {

    constructor(private store: Store, private metaService: MetaService, private notificationService: NotificationService, private translator: Translator, private router: Router) {
        super({
            ready: false
        });

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
            combineLatest([this.metaService.customFunctions$, this.metaService.ready$]).pipe(
              filter(([, metaReady]) => metaReady),
              switchMap(([customFunctions,]) =>
                    of(customFunctions?.filter(f => f.type === 'add' && this.metaService.customFunctionAllowed(f))
                        .map(f => ({
                            id: f.id,
                            text: f.text,
                            customFunction: f
                        } as CrudEditMenuItem))
                    )
                )),
                this.metaService.addFunction$
            ])
            .pipe(map(([customFunctions, addFunction]) => (addFunction && this.metaService.customFunctionAllowed(addFunction) ? [{
                id: addFunction.id,
                text: addFunction.text,
                customFunction: addFunction.id !== 'none' ? addFunction : undefined
            } as CrudEditMenuItem, ...customFunctions ?? []] : customFunctions)))
            .pipe(tap((addMenuItems) => this.updater((state, addMenuItems: CrudEditMenuItem[]|undefined) => ({
                ...state,
                addMenuItems
            }))(addMenuItems)))
        );

        this.effect(_ => combineLatest([this.metaService.customFunctions$, this.metaService.ready$])
            .pipe(filter(([, metaReady]) => metaReady))
            .pipe(switchMap(([customFunctions,]) =>
                of(customFunctions?.filter(f => f.type === 'export' && this.metaService.customFunctionAllowed(f))
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

        this.effect(_ => combineLatest([this.metaService.customFunctions$, this.metaService.ready$])
            .pipe(filter(([, metaReady]) => metaReady))
            .pipe(switchMap(([customFunctions,]) =>
                of(customFunctions?.filter(f => f.type === 'import' && this.metaService.customFunctionAllowed(f))
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
            combineLatest([this.metaService.customFunctions$, this.metaService.ready$]).pipe(
              filter(([, metaReady]) => metaReady),
              switchMap(([customFunctions,]) =>
                    of(customFunctions?.filter(f => f.multi && f.type === 'edit' && this.metaService.customFunctionAllowed(f))
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

    readonly ready$ = this.select(state => state.ready);
    readonly currentInteractionTarget$: Subject<Element | undefined> = new Subject<Element|undefined>();

    readonly reload$ = new Subject<void>();

    readonly functionAllowed = (identifier: FunctionIdentifier, data: CrudItem) =>
      combineLatest(([
        this.metaService.ready$,
        this.metaService.addFunction$,
        this.metaService.viewFunction$,
        this.metaService.editFunction$,
        this.metaService.customFunctions$
      ])).pipe(
        filter(([metaReady, , , , ]) => metaReady),
        switchMap(([, addFunction, viewFunction, editFunction, customFunctions]) => {
          switch (identifier) {
            case 'add':
              return (addFunction && this.metaService.customFunctionAllowed(addFunction)) ?? of(false);
            case 'view':
              return (data && viewFunction && this.metaService.customFunctionAllowed(viewFunction, data)) ?? of(false);
            case 'edit':
              return (data && editFunction && this.metaService.customFunctionAllowed(editFunction, data)) ?? of(false);
            case 'delete':
              return (data && this.metaService.dropAllowed(data)) ?? of(false);
            case 'print':
              return (data && this.metaService.printAllowed(data)) ?? of(false);
            case 'options':
              return of(true);
            case 'customoptions': {
              if (data && customFunctions) {
                const allowedAdditionalFunctions = customFunctions?.filter(f =>
                  this.metaService.customFunctionAllowed(f, data)
                );

                return of(allowedAdditionalFunctions?.length > 0);
              }

              return of(false);
            }
            default:
              return of(false);
          }
        })
      );

    readonly functionExecute = this.effect((request$: Observable<{ identifier: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element }>)=>
      combineLatest([request$, this.metaService.ready$, this.metaService.viewFunction$, this.metaService.editFunction$]).pipe(
        switchMap(([{ identifier, editLayoutIdentifier, data, target }, metaReady, viewFunction, editFunction]) => {
          if (!metaReady || !viewFunction || !editFunction) {
            return throwError(() => new Error('Meta service not ready'));
          }

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

          return of(undefined);
        })
      )
    );

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
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entity$, this.metaService.displayName$, this.metaService.headParams$),
          switchMap(([{ editLayout }, metaReady, entity, displayName, headParams]) => {
            if (!metaReady || !entity || !displayName || !headParams) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.create(editLayout ?? 'primary', headParams).pipe(
              withLatestFrom(this.metaService.getEditLayout(editLayout ?? 'primary', EditModes.CREATE)),
              map(([item, editLayout]) => ({
                  mode: EditModes.CREATE,
                  entity: entity,
                  item: item,
                  title: this.translator('datacontainer.titles.add', { entity: displayName }),
                  supportContinueAfterSave: false,
                  editLayout: editLayout,
                  apply: (editUtil, editedItem, continueAfterSave) => {
                    this.save({ item: editedItem as CrudItem, continueAfterSave });
                  },
                  cancel: () => {
                    this.updater((state) => ({
                      ...state,
                      itemDialog: undefined
                    }))();
                  }
                } as ItemEditDialog)),
              tap((itemDialog) => {
                this.updater((state, itemDialog: ItemEditDialog|undefined) => ({
                  ...state,
                  itemDialog
                }))(itemDialog);
            }));
          })
        )
    );

    readonly view = this.effect((request$: Observable<{ item: CrudItem, editLayout: string }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entity$, this.metaService.displayName$),
          switchMap(([{ item, editLayout }, metaReady, entity, displayName]) => {
            if (!metaReady || !entity || !displayName) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.byId(editLayout ?? 'primary', item.Id).pipe(
              withLatestFrom(this.metaService.getEditLayout(editLayout ?? 'primary', EditModes.VIEW)),
              map(([item, editLayout]) => ({
                mode: EditModes.VIEW,
                entity: entity,
                item: item,
                title: this.translator('datacontainer.titles.view', { entity: displayName }),
                supportContinueAfterSave: false,
                editLayout: editLayout,
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
              } as ItemEditDialog)));
          })
        )
    );

    readonly edit = this.effect((request$: Observable<{ item: CrudItem, editLayout: string }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entity$, this.metaService.displayName$),
          switchMap(([{ item, editLayout }, metaReady, entity, displayName]) => {
            if (!metaReady || !entity || !displayName) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.byId(editLayout ?? 'primary', item.Id).pipe(
              withLatestFrom(this.metaService.getEditLayout(editLayout ?? 'primary', EditModes.EDIT)),
              map(([item, editLayout]) => ({
                  mode: EditModes.EDIT,
                  entity: entity,
                  item: item,
                  title: this.translator('datacontainer.titles.edit', { entity: displayName }),
                  supportContinueAfterSave: false,
                  editLayout: editLayout,
                  apply: (editUtil, editedItem, continueAfterSave) => {
                    this.save({ item: editedItem as CrudItem, continueAfterSave });
                  },
                  cancel: () => {
                    this.updater((state) => ({
                      ...state,
                      itemDialog: undefined
                    }))();
                  }
                } as ItemEditDialog)),
              tap((itemDialog) => {
                  this.updater((state, itemDialog: ItemEditDialog|undefined) => ({
                    ...state,
                    itemDialog
                  }))(itemDialog);
                })
            );
          })
        )
    );

    readonly remove = this.effect((request$: Observable<{ item: CrudItem }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entityMetadata$, this.metaService.displayName$),
          switchMap(([{ item }, metaReady, entityMetadata, displayName]) => {
            if (!metaReady || !entityMetadata || !displayName) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.byId('primary', item.Id).pipe(
              map((item) =>
                ({
                  item: item,
                  title: this.translator('datacontainer.titles.remove', { entity: displayName }),
                  apply: () => {
                    this.drop({ item });
                  },
                  cancel: () => {
                    this.updater((state) => ({
                      ...state,
                      removeDialog: undefined
                    }))();
                  }
                } as ItemRemoveDialog)),
              tap((removeDialog) => this.updater((state, removeDialog: ItemRemoveDialog|undefined) => ({
                ...state,
                removeDialog
              }))(removeDialog)));
          })
        )
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
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entity$, this.metaService.headParams$),
          switchMap(([{ customFunction, items }, metaReady, entity, headParams]) => {
            if (!metaReady || !entity || !headParams) {
              return throwError(() => new Error('Meta service not ready'));
            }

            if (customFunction.entity) {
              this.patchState({
                itemDialog: {
                  mode: EditModes.EDIT,
                  entity: customFunction.entity,
                  item: items,
                  title: customFunction.text,
                  supportContinueAfterSave: customFunction.supportContinue,
                  editLayout: undefined,
                  externalEditor: false,
                  foreignEntity: customFunction.entity,
                  customFunction: customFunction,
                  apply: (editUtil, editedItem, continueAfterSave) => {
                    if (!continueAfterSave) {
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
                } as ItemEditDialog
              });
            } else {
              this.metaService.getEditLayout(customFunction.editLayout, EditModes.EDIT)
                .subscribe((editLayout) => {
                  this.metaService.prepareCustomFunction({
                    identifier: customFunction.id,
                    selection: items,
                    execute: (params) => {
                      this.updater((state, itemDialog: ItemEditDialog) => ({
                        ...state,
                        itemDialog
                      }))({
                        mode: EditModes.EDIT,
                        entity: entity,
                        item: params,
                        title: customFunction.text,
                        supportContinueAfterSave: customFunction.supportContinue,
                        editLayout,
                        externalEditor: customFunction.externalEditor,
                        foreignEntity: customFunction.entity,
                        customFunction: customFunction,
                        apply: (editUtil, editedItem, continueAfterSave) => {
                          if (!customFunction.externalEditor && !customFunction.entity) {
                            this.metaService.evaluateCustomFunction({
                              identifier: customFunction.id,
                              continueAfterSave,
                              editUtil,
                              param: editedItem,
                              save: (evaluatedResult) => {
                                if (Array.isArray(evaluatedResult)) {
                                  this.saveBatch({
                                    customFunction,
                                    items: evaluatedResult as Array<CrudItem>,
                                    continueAfterSave
                                  });
                                } else {
                                  this.save({ customFunction, item: evaluatedResult as CrudItem, continueAfterSave });
                                }
                              },
                              message: (message) => this.notificationService.triggerNotification({
                                message: this.translator(message),
                                severity: 'warning'
                              })
                            });
                          } else  {
                            if (!continueAfterSave) {
                              this.patchState({
                                itemDialog: undefined
                              });
                            }
                          }
                        },
                        cancel: () => {
                          this.patchState({
                            itemDialog: undefined
                          });
                        }
                      } as ItemEditDialog);
                    },
                    message: (message) => this.notificationService.triggerNotification({ message: this.translator(message), severity: 'info' }),
                    params: headParams
                  });
                });
            }

            return of(undefined);
          })
        )
    );

    readonly save = this.effect((request$: Observable<{ customFunction?: EntityCustomFunction, item: CrudItem, continueAfterSave: boolean }>) =>
      request$.pipe(
          withLatestFrom(this.metaService.ready$),
          switchMap(([{ customFunction, item, continueAfterSave }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.save(customFunction?.id ?? 'primary', item).pipe(
              tap(() => {
                this.notificationService.triggerNotification({ message: this.translator('editing.notifications.saved'), severity: 'info' });

                if (!continueAfterSave) {
                  this.patchState((state) => ({
                    itemDialog: undefined
                  }));

                  this.reload();
                }
              }),
              catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
              }));
          })
        )
    );

    readonly saveBatch = this.effect((request$: Observable<{ customFunction: EntityCustomFunction, items: CrudItem[], continueAfterSave: boolean }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$),
          switchMap(([{ customFunction, items, continueAfterSave }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.saveBatch(customFunction?.id ?? 'primary', items).pipe(
              tap(() => {
                this.notificationService.triggerNotification({ message: this.translator('editing.notifications.saved'), severity: 'info' });

                if (!continueAfterSave) {
                  this.updater((state) => ({
                    ...state,
                    itemDialog: undefined
                  }))();

                  this.reload();
                }
              }),
              catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
              })
            );
          })
        )
    );

    readonly uploadItems = this.effect((request$: Observable<{ query: string, file: File }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$),
          switchMap(([{ query, file }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.importItems(query, file).pipe(
              tap(() => {
                this.notificationService.triggerNotification({ message: this.translator('editing.notifications.saved'), severity: 'info' });

                this.updater((state) => ({
                  ...state,
                  importDialog: undefined
                }))();

                this.reload();
              }),
              catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
              })
            );
          })
        )
    );

    readonly drop = this.effect((request$: Observable<{ item: CrudItem }>) =>
        request$.pipe(withLatestFrom(this.metaService.ready$)).pipe(
          switchMap(([{ item }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.drop(item).pipe(
              tap(() => {
                this.notificationService.triggerNotification({ message: this.translator('editing.notifications.removed'), severity: 'info' });

                this.updater((state) => ({
                  ...state,
                  removeDialog: undefined
                }))();

                this.reload();
              }),
              catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
              })
            );
          })
        )
    );

    readonly importItems = this.effect((request$: Observable<{ customFunction: EntityCustomFunction }>) =>
      request$.pipe(
        withLatestFrom(this.metaService.ready$),
        switchMap(([{ customFunction }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            this.patchState({
              importDialog: {
                importFunction: customFunction,
                apply: (file) => this.uploadItems({ query: customFunction.id, file }),
                cancel: () => this.updater((state) => ({
                  ...state,
                  importDialog: undefined
                }))()
              } as ImportDialog
            });

            return of(undefined);
        })
      )
    );

    readonly exportItems = this.effect((request$: Observable<{ customFunction: EntityCustomFunction, items: CrudItem[] }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$),
          switchMap(([{ customFunction, items }, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return this.metaService.exportItems(customFunction.id, items).pipe(
              catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
              }),
              map((url) => url && window.open(url))
            )
          })
        )
    );

    readonly detailColumnEdit = this.effect((request$: Observable<{ mode: EditModes, item: unknown, column: GridLayoutColumn }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.ready$, this.metaService.entity$),
          switchMap(([{ column , mode, item }, metaReady, entity]) => {
              if (!metaReady || !entity) {
                return throwError(() => new Error('Meta service not ready'));
              }

              return this.metaService.getEditLayout(column.popuplayout ?? 'primary', mode).pipe(
                tap((editLayout) => {
                    if (editLayout) {
                      this.patchState({
                        detailColumnEditDialog: {
                          mode: mode,
                          entity: entity,
                          item: cloneDeep(item),
                          title: column.caption,
                          dataMember: column.dataMember,
                          editLayout: editLayout,
                          apply: (editUtil, editedItem) => {
                            if (column.dataMember) {
                              set(item as Record<string, unknown>, column.dataMember, get(editedItem, column.dataMember));
                            }

                            this.patchState({
                              detailColumnEditDialog: undefined
                            });
                          },
                          cancel: () => {
                            this.patchState({
                              detailColumnEditDialog: undefined
                            });
                          }
                        } as DetailColumnEditDialog
                      });
                    }
                  }
                )
              );
            })
          )
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

    readonly selectPrint = this.effect((request$: Observable<{ items: CrudItem[], target: Element }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.entityDocuments$, this.metaService.ready$),
          switchMap(([{ items, target }, entityDocuments, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            if (entityDocuments) {

              if (items.filter(item => !this.metaService.printAllowed(item)).length) {
                this.notificationService.triggerNotification({ message: this.translator('editing.notifications.notallowed'), severity: 'info' });

                return of(undefined);
              }

              this.currentInteractionTarget$.next(target);

              return of({
                  items: items,
                  actions: entityDocuments.map(d => ({
                      id: d.Id,
                      text: d.Name,
                      icon: 'bi bi-file-earmark-fill',
                      execute: (_target) => this.print({ documentId: d.Id, items: items })
                  } as CrudAction))
              });
            }

            return of(undefined);
          }),
          tap((selectPrintSheet) =>
              this.patchState({
                selectPrintSheet: selectPrintSheet
              })
          )
        )
    );

    readonly selectExport = this.effect((request$: Observable<{ items: CrudItem[], target: Element }>) =>
      request$.pipe(
        withLatestFrom(this.exportMenuItems$),
        map(([selectExportRequest, exportMenuItems]) => {
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
        }),
        tap((selectExportSheet) =>
            this.patchState({ selectExportSheet: selectExportSheet })
        )
      )
    );

    readonly selectImport = this.effect((request$: Observable<{ target: Element }>) =>
      request$.pipe(
        withLatestFrom(this.importMenuItems$),
        map(([selectImportRequest, importMenuItems]) => {
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
        }),
        tap((selectImportSheet) =>
          this.patchState({
            selectImportSheet: selectImportSheet
          })
        )
      )
    );

    readonly selectOptions = this.effect((request$: Observable<{ item: CrudItem, target: Element, defaultEditLayout: string }>) =>
        request$.pipe(
          withLatestFrom(this.metaService.customFunctions$, this.metaService.ready$),
          switchMap(([{ item }, customFunctions, metaReady]) => {
            if (!metaReady) {
              return throwError(() => new Error('Meta service not ready'));
            }

            return of(customFunctions?.filter(f => f.type === 'edit' && this.metaService.customFunctionAllowed(f, item))
              .map(f => ({
                id: f.id,
                icon: f.icon,
                text: f.text,
                execute: (_target) => this.customEdit({ customFunction: f, items: [item]})
              } as CrudAction)));
          }),
          withLatestFrom(
            request$,
            this.metaService.viewFunction$,
            this.metaService.editFunction$,
          ),
          map(([customFunctions, { item, target, defaultEditLayout }, viewFunction, editFunction]) => {

            const actions = [] as CrudAction[];

            if (viewFunction && this.metaService.customFunctionAllowed(viewFunction, item)) {
                actions.push({
                    id: 'view',
                    icon: viewFunction.icon ?? 'bi bi-eye-fill',
                    text: viewFunction.text,
                    execute: (_target) => viewFunction.id === 'view'
                        ? this.view({ item, editLayout: defaultEditLayout })
                        : this.customEdit({ customFunction: viewFunction, items: [item]})
                });
            }

            if (editFunction && this.metaService.customFunctionAllowed(editFunction, item)) {
                actions.push({
                    id: 'edit',
                    icon: editFunction.icon ?? 'bi bi-pencil-fill',
                    text: editFunction.text,
                    execute: (_target) => editFunction.id === 'edit'
                        ? this.edit({ item, editLayout: defaultEditLayout })
                        : this.customEdit({ customFunction: editFunction, items: [item]})
                });
              }

            if (this.metaService.dropAllowed(item)) {
                actions.push({
                    id: 'delete',
                    icon: 'bi bi-trash-fill',
                    text: this.translator('datacontainer.actions.remove'),
                    execute: (_target) => this.remove({ item })
                });
            }

            if (this.metaService.printAllowed(item)) {
                actions.push({
                    id: 'print',
                    icon: 'bi bi-printer-fill',
                    text: this.translator('datacontainer.actions.print'),
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
        }),
        tap((selectActionSheet) => this.patchState({
            selectActionSheet: selectActionSheet
          })
        )
      )
    );

    readonly selectCustomOptions = this.effect((request$: Observable<{ item: CrudItem, target: Element, defaultEditLayout: string }>) =>
        request$.pipe(
          withLatestFrom(
            this.metaService.customFunctions$,
            this.metaService.ready$
          ),
          switchMap(([{ item }, customFunctions, metaReady]) => {
              if (!metaReady) {
                return throwError(() => new Error('Meta service not ready'));
              }

              return of(customFunctions?.filter(f => f.type === 'edit' && this.metaService.customFunctionAllowed(f, item))
                .map(f => ({
                  id: f.id,
                  icon: f.icon,
                  text: f.text,
                  execute: (_target) => this.customEdit({ customFunction: f, items: [item] })
                } as CrudAction)));
            }),
          withLatestFrom(request$),
          map(([customFunctions, { item, target }]) => {
              const actions = [] as CrudAction[];

              if (customFunctions) {
                actions.push(...customFunctions);
              }

              this.currentInteractionTarget$.next(target);

              return {
                item,
                actions
              };
            }),
          tap((selectActionSheet) => this.patchState({
              selectActionSheet: selectActionSheet
            })
          )
        )
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
