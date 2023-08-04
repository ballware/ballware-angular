import { ComponentStore } from '@ngrx/component-store';
import { CrudState } from "./crud.state";
import { CrudServiceApi, FunctionIdentifier } from '../crud.service';
import { CrudItem, EntityCustomFunction } from '@ballware/meta-model';
import { combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MetaService } from '../meta.service';
import { isEqual } from 'lodash';

export class CrudStore extends ComponentStore<CrudState> implements CrudServiceApi {
    constructor(private metaService: MetaService) {
        super({});

        this.state$
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                console.debug('CrudStore state update');
                console.debug(state);
            });
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

    create(editLayout: string): void {
        throw new Error('Method not implemented.');
    }
    view(item: CrudItem, editLayout: string): void {
        throw new Error('Method not implemented.');
    }
    edit(item: CrudItem, editLayout: string): void {
        throw new Error('Method not implemented.');
    }
    remove(item: CrudItem): void {
        throw new Error('Method not implemented.');
    }
    print(documentId: string, items: CrudItem[]): void {
        throw new Error('Method not implemented.');
    }
    customEdit(customFunction: EntityCustomFunction, items?: CrudItem[] | undefined): void {
        throw new Error('Method not implemented.');
    }
    selectAdd(target: Element, defaultEditLayout: string): void {
        throw new Error('Method not implemented.');
    }
    selectPrint(item: CrudItem, target: Element): void {
        throw new Error('Method not implemented.');
    }
    selectOptions(item: CrudItem, target: Element, defaultEditLayout: string): void {
        throw new Error('Method not implemented.');
    }
    selectCustomOptions(item: CrudItem, target: Element, defaultEditLayout: string): void {
        throw new Error('Method not implemented.');
    }


}