import { I18NextPipe } from 'angular-i18next';
import { map, Observable, of, Subject, switchMap } from 'rxjs';
import { BehaviorSubject, combineLatest, takeUntil } from 'rxjs';
import { CrudItem, EditLayout, EntityCustomFunction } from '@ballware/meta-model';
import { EditModes } from '../editmodes';
import { MetaService } from '../meta.service';
import { CrudService, FunctionIdentifier } from '../crud.service';
import { Injectable } from '@angular/core';

@Injectable()
export class DefaultCrudService extends CrudService {

  protected _queryIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  protected _storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);

  public functionAllowed$: Observable<((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined>;
  public functionExecute$: Observable<((button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => void)|undefined>;

  public addMenuItems$: Observable<{id: string, text: string, customFunction?: EntityCustomFunction}[]|undefined>;
  public headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

  public exportMenuItems$: Observable<{id: string, text: string, customFunction: EntityCustomFunction}[]|undefined>;
  public importMenuItems$: Observable<{id: string, text: string, customFunction: EntityCustomFunction}[]|undefined>;

  public itemDialog$: Observable<{ mode: EditModes, item: Record<string, unknown>, title: string, editLayout?: EditLayout, apply: (item: Record<string, unknown>) => void, cancel: () => void}|undefined>;
  public removeDialog$: Observable<{ item: CrudItem, title: string }|undefined>;

  public selectAddSheet$: Observable<{
    target: Element,
    actions: {
      id: string,
      text: string,
      icon: string,
      target: Element,
      execute: (target: Element) => void
    }[]
  }|undefined>;

  public selectActionSheet$: Observable<{ item: CrudItem, target: Element, actions: {
    id: string,
    text: string,
    icon: string,
    item: CrudItem,
    target: Element,
    execute: (target: Element) => void
  }[]}|undefined>;

  public selectPrintSheet$: Observable<{ item: CrudItem, target: Element, actions: {
    id: string,
    text: string,
    icon: string,
    item: CrudItem,
    target: Element,
    execute: (target: Element) => void
  }[]}|undefined>;

  public fetchedItems$: Observable<CrudItem[]|undefined>;

  private load$ = new BehaviorSubject<boolean>(false);

  private addRequest$ = new Subject<{ editLayoutId: string }|undefined>;
  private viewRequest$ = new Subject<{ item: CrudItem, editLayoutId: string }|undefined>;
  private editRequest$ = new Subject<{ item: CrudItem, editLayoutId: string }|undefined>;
  private customEditRequest$ = new Subject<{ customFunction: EntityCustomFunction, items: CrudItem[]|undefined }|undefined>;
  private removeRequest$ = new Subject<{ item: CrudItem }|undefined>;

  private itemRequest$ = new Subject<{ mode: EditModes, item: Record<string, unknown>, title: string, editLayout?: EditLayout, apply: (item: Record<string, unknown>) => void, cancel: () => void}|undefined>;

  private selectAddRequest$ = new Subject<{ target: Element, defaultEditLayout: string }>();
  private selectPrintRequest$ = new Subject<{ item: CrudItem, target: Element }|undefined>();
  private selectOptionsRequest$ = new Subject<{ item: CrudItem, target: Element, defaultEditLayout: string, onlyCustomOptions: boolean }|undefined>();

  constructor(private metaService: MetaService, private translationService: I18NextPipe) {
    super();

    this.itemDialog$ = this.itemRequest$.pipe(takeUntil(this.destroy$));

    this.functionAllowed$ = combineLatest(([
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

    this.functionExecute$ = of((identifier: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => {
      switch (identifier) {
        case 'add':
          break;
        case 'view':
          this.view(data, editLayoutIdentifier);
          break;
        case 'edit':
          this.edit(data, editLayoutIdentifier);
          break;
        case 'delete':
          this.remove(data);
          break;
        case 'print':
          this.selectPrint(data, target);
          break;
        case 'options':
          this.selectOptions(data, target, editLayoutIdentifier);
          break;
        case 'customoptions':
          this.selectCustomOptions(data, target, editLayoutIdentifier);
          break;
      }
    });

    this.addMenuItems$ = combineLatest([
      combineLatest([
        this.metaService.customFunctions$,
        this.metaService.customFunctionAllowed$
      ]).pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
        of(customFunctions?.filter(f => f.type === 'add' && customFunctionAllowed && customFunctionAllowed(f))
          .map(f => ({
            id: f.id,
            text: f.text,
            customFunction: f
          }))))),
      this.metaService.addAllowed$,
      this.metaService.displayName$
    ]).pipe(map(([customFunctions, addAllowed, displayName]) => (addAllowed && addAllowed() ? [{
        id: 'none',
        text: this.translationService.transform('datacontainer.actions.add', { entity: displayName })
      }, ...customFunctions ?? []] : customFunctions)));

    this.headCustomFunctions$ = combineLatest([
        metaService.customFunctions$,
        metaService.customFunctionAllowed$
      ]).pipe(takeUntil(this.destroy$))
      .pipe(map(([customFunctions, customFunctionAllowed]) => customFunctions?.filter(f => f.type === 'edit' && f.multi && customFunctionAllowed && customFunctionAllowed(f))));

    this.exportMenuItems$ = combineLatest([
        this.metaService.customFunctions$,
        this.metaService.customFunctionAllowed$
      ]).pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
        of(customFunctions?.filter(f => f.type === 'export' && customFunctionAllowed && customFunctionAllowed(f))
          .map(f => ({ id: f.id, text: f.text, customFunction: f })))));

    this.importMenuItems$ = combineLatest([
      this.metaService.customFunctions$,
      this.metaService.customFunctionAllowed$
    ]).pipe(switchMap(([customFunctions, customFunctionAllowed]) =>
      of(customFunctions?.filter(f => f.type === 'import' && customFunctionAllowed && customFunctionAllowed(f))
        .map(f => ({ id: f.id, text: f.text, customFunction: f })))));


    combineLatest([this.metaService.getEditLayout$, this.metaService.create$, this.metaService.displayName$, this.metaService.headParams$, this.addRequest$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([getEditLayout, create, displayName, headParams, addRequest]) => (getEditLayout && create && displayName && headParams && addRequest) ?
        create('primary', headParams)
          .pipe(map((item) => ({
            mode: EditModes.CREATE,
            item: item,
            title: this.translationService.transform('datacontainer.titles.add', { entity: displayName }),
            editLayout: getEditLayout(addRequest.editLayoutId, EditModes.CREATE),
            apply: () => { this.itemRequest$.next(undefined); },
            cancel: () => { this.itemRequest$.next(undefined); }
          })))
        : of(undefined)))
      .subscribe((request) => {
        this.itemRequest$.next(request);
      });

    combineLatest([this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$, this.viewRequest$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([getEditLayout, byId, displayName, viewRequest]) => (getEditLayout && byId && displayName && viewRequest) ?
        byId(viewRequest.item.Id)
          .pipe(map((item) => ({
            mode: EditModes.VIEW,
            item: item,
            title: this.translationService.transform('datacontainer.titles.view', { entity: displayName }),
            editLayout: getEditLayout(viewRequest.editLayoutId, EditModes.VIEW),
            apply: () => { this.itemRequest$.next(undefined); },
            cancel: () => { this.itemRequest$.next(undefined); }
          })))
        : of(undefined)))
      .subscribe((request) => {
        this.itemRequest$.next(request);
      });

    combineLatest([this.metaService.getEditLayout$, this.metaService.byId$, this.metaService.displayName$, this.editRequest$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([getEditLayout, byId, displayName, editRequest]) => (getEditLayout && byId && displayName && editRequest) ?
        byId(editRequest.item.Id)
          .pipe(map((item) => ({
            mode: EditModes.EDIT,
            item: editRequest.item,
            title: this.translationService.transform('datacontainer.titles.edit', { entity: displayName }),
            editLayout: getEditLayout(editRequest.editLayoutId, EditModes.EDIT),
            apply: () => { this.itemRequest$.next(undefined); },
            cancel: () => { this.itemRequest$.next(undefined); }
          })))
        : of(undefined)))
        .subscribe((request) => {
          this.itemRequest$.next(request);
        });


    this.removeDialog$ = combineLatest([this.metaService.entityMetadata$, this.metaService.displayName$, this.removeRequest$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityMetadata, displayName, removeRequest]) => (entityMetadata && displayName && removeRequest) ? ({
        item: removeRequest.item,
        title: this.translationService.transform('datacontainer.titles.remove', { entity: displayName }),
        apply: () => { this.removeRequest$.next(undefined); },
        cancel: () => { this.removeRequest$.next(undefined); }
      })
      : undefined));

    combineLatest([this.metaService.getEditLayout$, this.metaService.prepareCustomFunction$, this.metaService.headParams$, this.customEditRequest$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([getEditLayout, prepareCustomFunction, headParams, customEditRequest]) => (getEditLayout && prepareCustomFunction && customEditRequest && headParams
        && prepareCustomFunction(customEditRequest.customFunction.id, customEditRequest.items, param => {
          this.itemRequest$.next({
            mode: EditModes.EDIT,
            item: param,
            title: customEditRequest.customFunction.text,
            editLayout: getEditLayout(customEditRequest.customFunction.editLayout ?? 'primary', EditModes.EDIT),
            apply: () => { this.itemRequest$.next(undefined); },
            cancel: () => { this.itemRequest$.next(undefined); }
          });
        }, message => console.log(message), headParams)));


    this.selectActionSheet$ = combineLatest([
      this.metaService.viewAllowed$,
      this.metaService.editAllowed$,
      this.metaService.dropAllowed$,
      this.metaService.printAllowed$,
      this.metaService.customFunctionAllowed$,
      this.metaService.customFunctions$,
      this.metaService.entityDocuments$,
      this.selectOptionsRequest$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([viewAllowed, editAllowed, dropAllowed, printAllowed, customFunctionAllowed, customFunctions, entityDocuments, selectOptionsRequest]) => {
        if (selectOptionsRequest) {
          const actions = [] as {
            id: string,
            text: string,
            icon: string,
            item: CrudItem,
            target: Element,
            execute: (target: Element) => void
          }[];

          if (!selectOptionsRequest.onlyCustomOptions) {
            if (viewAllowed && viewAllowed(selectOptionsRequest.item)) {
              actions.push({
                id: 'view',
                text: this.translationService.transform('datacontainer.actions.show'),
                icon: 'bi bi-eye-fill',
                item: selectOptionsRequest.item,
                target: selectOptionsRequest.target,
                execute: (_target) => this.view(selectOptionsRequest.item, selectOptionsRequest.defaultEditLayout),
              });
            }

            if (editAllowed && editAllowed(selectOptionsRequest.item)) {
              actions.push({
                id: 'edit',
                text: this.translationService.transform('datacontainer.actions.edit'),
                icon: 'bi bi-pencil-fill',
                item: selectOptionsRequest.item,
                target: selectOptionsRequest.target,
                execute: (_target) => this.edit(selectOptionsRequest.item, selectOptionsRequest.defaultEditLayout),
              });
            }

            if (dropAllowed && dropAllowed(selectOptionsRequest.item)) {
              actions.push({
                id: 'delete',
                text: this.translationService.transform('datacontainer.actions.remove'),
                icon: 'bi bi-trash-fill',
                item: selectOptionsRequest.item,
                target: selectOptionsRequest.target,
                execute: (_target) => this.remove(selectOptionsRequest.item),
              });
            }

            if (printAllowed && printAllowed(selectOptionsRequest.item) && entityDocuments) {
              entityDocuments.forEach(d => actions.push({
                id: d.Id,
                text: d.Name,
                icon: 'bi bi-printer-fill',
                item: selectOptionsRequest.item,
                target: selectOptionsRequest.target,
                execute: (_target) => this.print(d.Id, [selectOptionsRequest.item])
              }));
            }
          }

          if (customFunctions && customFunctionAllowed) {
            customFunctions
              .filter(f => f.type === 'edit' && customFunctionAllowed(f, selectOptionsRequest.item))
              .forEach(f => (
                actions.push({
                  id: f.id,
                  text: f.text,
                  icon: f.icon ?? 'bi bi-caret-right-fill',
                  item: selectOptionsRequest.item,
                  target: selectOptionsRequest.target,
                  execute: (_target) => this.customEdit(f, [selectOptionsRequest.item]),
                })
              ));
          }

          return {
            item: selectOptionsRequest.item,
            target: selectOptionsRequest.target,
            actions
          };
        }

        return undefined;
      }));


    this.selectPrintSheet$ = combineLatest([this.metaService.entityDocuments$, this.selectPrintRequest$])
      .pipe(takeUntil(this.destroy$))
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
            }))
          };
        }

        return undefined;
      }));

    this.fetchedItems$ = combineLatest([this.load$, this._queryIdentifier$, this.metaService.query$, this.metaService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([load, queryIdentifier, query, fetchParams]) => {
        if (load && queryIdentifier && fetchParams && query) {
          return query(queryIdentifier, fetchParams); }
        else {
          return of(undefined);
        }
      }));

    this.selectAddSheet$ = combineLatest([this.selectAddRequest$, this.addMenuItems$])
      .pipe(takeUntil(this.destroy$))
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
              }))
            };
          }
        }

        return undefined;
      }));
  }

  public setQuery(query: string): void {
    this._queryIdentifier$.next(query);
  }

  public setStorageIdentifier(identifier: string): void {
    this._storageIdentifier$.next(identifier);
  }

  public reload() {
    this.load$.next(true);
  }

  public create(editLayout: string) {
    this.addRequest$.next({ editLayoutId: editLayout });
  }

  public view(item: CrudItem, editLayout: string) {
    this.viewRequest$.next({ item, editLayoutId: editLayout });
  }

  public edit(item: CrudItem, editLayout: string) {
    this.editRequest$.next({ item, editLayoutId: editLayout });
  }

  public remove(item: CrudItem) {
    console.log('Removing ' + item.Id);
  }

  public print(documentId: string, items: CrudItem[]) {
    console.log('Printing ' + documentId + ' with items' + items.map(item => item.Id).join(','));
  }

  public customEdit(customFunction: EntityCustomFunction, items?: CrudItem[]) {
    this.customEditRequest$.next({ customFunction, items });
  }

  public selectAdd(target: Element, defaultEditLayout: string) {
    this.selectAddRequest$.next({ target, defaultEditLayout });
  }

  public selectPrint(item: CrudItem, target: Element) {
    this.selectPrintRequest$.next({ item, target });
  }

  public selectOptions(item: CrudItem, target: Element, defaultEditLayout: string) {
    this.selectOptionsRequest$.next({ item, target, defaultEditLayout, onlyCustomOptions: false });
  }

  public selectCustomOptions(item: CrudItem, target: Element, defaultEditLayout: string) {
    this.selectOptionsRequest$.next({ item, target, defaultEditLayout, onlyCustomOptions: true });
  }
}
