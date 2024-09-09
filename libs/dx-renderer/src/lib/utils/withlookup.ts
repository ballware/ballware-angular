import { ApiError } from "@ballware/meta-api";
import { EditLayoutItem } from "@ballware/meta-model";
import { AutocompleteStoreDescriptor, EditService, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, NotificationService } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { compileGetter } from 'devextreme/utils';
import { catchError, combineLatest, from, map, of, switchMap, takeUntil } from "rxjs";
import { createArrayDatasource, createAutocompleteDataSource, createLookupDataSource } from "./datasource";
import { HasDestroy } from "./hasdestroy";
import { HasLookup } from "./haslookup";
import { HasEditItemLifecycle } from "./hasedititemlifecycle";

type Constructor<T> = new(...args: any[]) => T;

export function WithLookup<T extends Constructor<HasDestroy & HasEditItemLifecycle>>(Base: T = (class {} as any)) {
    return class extends Base implements HasLookup {
      
      public lookup: LookupDescriptor|undefined;
      public dataSource: DataSource|null = null;

      public hasLookupItemHintValue!: boolean;

      public lookupItemKeyValueGetter: ((item: Record<string, unknown>) => unknown)|undefined;
      public lookupItemDisplayValueGetter: ((item: Record<string, unknown>) => string)|undefined;
      public lookupItemHintValueGetter: ((item: Record<string, unknown>) => string)|undefined;
      
      public getLookupItemKeyValue(item: Record<string, unknown>) {    
        return this.lookupItemKeyValueGetter ? this.lookupItemKeyValueGetter(item) : undefined;
      }    

      public getLookupItemDisplayValue(item: Record<string, unknown>) {    
        return this.lookupItemDisplayValueGetter ? this.lookupItemDisplayValueGetter(item) : undefined;
      }
    
      public getLookupItemHintValue(item: Record<string, unknown>) {    
        return this.lookupItemHintValueGetter ? this.lookupItemHintValueGetter(item) : undefined;
      }
    
      public get hasLookupItemHint() {
        return !!this.hasLookupItemHintValue;
      }

      public setLookupItems(items: Array<any>) {
        return createArrayDatasource(items).then(dataSource => this.dataSource = dataSource);
      }

      initLookup(layoutItem: EditLayoutItem, editService: EditService, lookupService: LookupService, notificationService: NotificationService) {

        this.registerOption('items', () => this.dataSource?.items(), (value) => this.setLookupItems(value  as []));

        return combineLatest([editService.getValue$, lookupService.lookups$])
              .pipe(takeUntil(this.destroy$))
              .pipe(map((([getValue, lookups]) => {
                if (getValue && lookups) {
                  const lookup = layoutItem?.options?.lookup;
                  const lookupParam = layoutItem?.options?.lookupParam;

                  const myLookup = lookup && lookups ? (lookups[lookup] as LookupDescriptor|LookupCreator) : undefined;

                  if (myLookup) {
                    if (lookupParam && myLookup as LookupCreator) {
                      this.lookup = (myLookup as LookupCreator)(getValue({ dataMember: lookupParam }) as string|string[]);
                    } else if (myLookup as LookupDescriptor) {
                      this.lookup = myLookup as LookupDescriptor;
                    }

                    if (this.lookup) {
                      const currentLookup = this.lookup;

                      if (currentLookup.type === 'lookup') {
                        this.dataSource = createLookupDataSource(
                          () => (currentLookup.store as LookupStoreDescriptor).listFunc()
                            .pipe(catchError((error: ApiError) => {
                              notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                              
                              return of([]);              
                            })),
                          (id) => (currentLookup.store as LookupStoreDescriptor).byIdFunc(id)
                            .pipe(catchError((error: ApiError) => {
                              notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });       
                              
                              return of();
                            }))
                        );
                      } else if (currentLookup.type === 'autocomplete') {
                        this.dataSource = createAutocompleteDataSource(
                          () => (currentLookup.store as AutocompleteStoreDescriptor).listFunc()
                            .pipe(catchError((error: ApiError) => {
                              notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                              
                              return of([]);              
                            }))
                        );
                      }                      
                    }                    
                  }  
                  
                  this.hasLookupItemHintValue = !!layoutItem?.options?.hintExpr;

                  const keyValueGetter = compileGetter(layoutItem.options?.valueExpr ?? (myLookup as LookupDescriptor)?.valueMember ?? this.dataSource?.key() ?? 'Id');

                  this.lookupItemKeyValueGetter = (item) => keyValueGetter(item);

                  const displayValueGetter = compileGetter(layoutItem?.options?.displayExpr ?? (myLookup as LookupDescriptor)?.displayMember ?? 'Name');                
          
                  this.lookupItemDisplayValueGetter = (item) => displayValueGetter(item);
          
                  const hintValueGetter = layoutItem?.options?.hintExpr ? compileGetter(layoutItem.options.hintExpr) : undefined;
          
                  this.lookupItemHintValueGetter = hintValueGetter ? (item) => hintValueGetter(item) : undefined;
                }                
              })));
      }

      initStaticLookup(layoutItem: EditLayoutItem, editService: EditService) {
        
        this.registerOption('items', () => this.dataSource?.items(), (value) => this.setLookupItems(value  as []));

        return combineLatest([editService.getValue$])              
              .pipe(takeUntil(this.destroy$))
              .pipe(switchMap(([getValue]) => getValue ? from(createArrayDatasource(layoutItem?.options?.items ?? (layoutItem?.options?.itemsMember ? getValue({ dataMember: layoutItem?.options?.itemsMember }) as any[] : []))) : of(undefined)))
              .pipe(map((dataSource) => {
                if (dataSource) {
                  this.dataSource = dataSource;

                  this.hasLookupItemHintValue = !!layoutItem?.options?.hintExpr;

                  const keyValueGetter = compileGetter(layoutItem.options?.valueExpr ?? this.dataSource?.key() ?? 'Id');

                  this.lookupItemKeyValueGetter = (item) => keyValueGetter(item);

                  const displayValueGetter = compileGetter(layoutItem?.options?.displayExpr ?? 'Name');                
          
                  this.lookupItemDisplayValueGetter = (item) => displayValueGetter(item);
          
                  const hintValueGetter = layoutItem?.options?.hintExpr ? compileGetter(layoutItem.options.hintExpr) : undefined;
          
                  this.lookupItemHintValueGetter = hintValueGetter ? (item) => hintValueGetter(item) : undefined;                  
                }
              }));
      }
    }
}
