import { ApiError } from "@ballware/meta-api";
import { AutocompleteStoreDescriptor, EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, NOTIFICATION_SERVICE, NotificationService } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { compileGetter } from 'devextreme/utils';
import { BehaviorSubject, catchError, combineLatest, map, of, takeUntil } from "rxjs";
import { createArrayDatasource, createAutocompleteDataSource, createLookupDataSource } from "../utils";
import { Destroy, EditItemLivecycle } from "@ballware/renderer-commons";
import { Directive, Inject, OnInit } from "@angular/core";

@Directive({
  standalone: true
})
export class Lookup implements OnInit {
  
  private _lookup: LookupDescriptor|undefined;
  private _dataSource$ = new BehaviorSubject<DataSource|null>(null);

  private _hasLookupItemHintValue!: boolean;

  private _lookupItemKeyValueGetter: ((item: Record<string, unknown>) => unknown)|undefined;
  private _lookupItemDisplayValueGetter: ((item: Record<string, unknown>) => string)|undefined;
  private _lookupItemHintValueGetter: ((item: Record<string, unknown>) => string)|undefined;
  
  public getLookupItemKeyValue(item: Record<string, unknown>) {    
    return this._lookupItemKeyValueGetter ? this._lookupItemKeyValueGetter(item) : undefined;
  }    

  public getLookupItemDisplayValue(item: Record<string, unknown>) {    
    return this._lookupItemDisplayValueGetter ? this._lookupItemDisplayValueGetter(item) : undefined;
  }

  public getLookupItemHintValue(item: Record<string, unknown>) {    
    return this._lookupItemHintValueGetter ? this._lookupItemHintValueGetter(item) : undefined;
  }

  public get hasLookupItemHint() {
    return !!this._hasLookupItemHintValue;
  }

  public get lookup() {
    return this._lookup;
  }

  public get dataSource$() {
    return this._dataSource$;
  }

  public setLookupItems(items: Array<any>) {
    return createArrayDatasource(items).then(dataSource => this._dataSource$.next(dataSource));
  }

  constructor(
    private destroy: Destroy, 
    private livecycle: EditItemLivecycle,
    @Inject(EDIT_SERVICE) private editService: EditService,
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.livecycle.registerOption('items', () => this._dataSource$.getValue()?.items(), (value) => this.setLookupItems(value  as []));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          combineLatest([this.editService.getValue$, this.lookupService.lookups$])
              .pipe(takeUntil(this.destroy.destroy$))
              .subscribe(([getValue, lookups]) => {
                if (getValue && lookups) {
                  const lookup = layoutItem?.options?.lookup;
                  const lookupParam = layoutItem?.options?.lookupParam;

                  const myLookup = lookup && lookups ? (lookups[lookup] as LookupDescriptor|LookupCreator) : undefined;

                  if (myLookup) {
                    if (lookupParam && myLookup as LookupCreator) {
                      this._lookup = (myLookup as LookupCreator)(getValue({ dataMember: lookupParam }) as string|string[]);
                    } else if (myLookup as LookupDescriptor) {
                      this._lookup = myLookup as LookupDescriptor;
                    }

                    if (this.lookup) {
                      const currentLookup = this.lookup;

                      if (currentLookup.type === 'lookup') {
                        this._dataSource$.next(createLookupDataSource(
                          () => (currentLookup.store as LookupStoreDescriptor).listFunc()
                            .pipe(catchError((error: ApiError) => {
                              this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                              
                              return of([]);              
                            })),
                          (id) => (currentLookup.store as LookupStoreDescriptor).byIdFunc(id)
                            .pipe(catchError((error: ApiError) => {
                              this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });       
                              
                              return of();
                            }))
                        ));
                      } else if (currentLookup.type === 'autocomplete') {
                        this._dataSource$.next(createAutocompleteDataSource(
                          () => (currentLookup.store as AutocompleteStoreDescriptor).listFunc()
                            .pipe(catchError((error: ApiError) => {
                              this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                              
                              return of([]);              
                            }))
                        ));
                      }                      
                    }                    
                  } else if (layoutItem?.options?.items || layoutItem?.options?.itemsMember) {
                    createArrayDatasource(layoutItem?.options?.items ?? (layoutItem?.options?.itemsMember ? getValue({ dataMember: layoutItem?.options?.itemsMember }) as any[] : []))
                      .then(dataSource => this._dataSource$.next(dataSource));
                  }
                  
                  this.dataSource$
                    .pipe(takeUntil(this.destroy.destroy$))
                    .subscribe(dataSource => {                      
                      this._hasLookupItemHintValue = !!layoutItem?.options?.hintExpr;

                      const keyValueGetter = compileGetter(layoutItem.options?.valueExpr ?? (myLookup as LookupDescriptor)?.valueMember ?? dataSource?.key() ?? 'Id');
    
                      this._lookupItemKeyValueGetter = (item) => keyValueGetter(item);
    
                      const displayValueGetter = compileGetter(layoutItem?.options?.displayExpr ?? (myLookup as LookupDescriptor)?.displayMember ?? 'Name');                
              
                      this._lookupItemDisplayValueGetter = (item) => displayValueGetter(item);
              
                      const hintValueGetter = layoutItem?.options?.hintExpr ? compileGetter(layoutItem.options.hintExpr) : undefined;
              
                      this._lookupItemHintValueGetter = hintValueGetter ? (item) => hintValueGetter(item) : undefined;                      
                    });
                }                
              });
        }
      });
  }
}