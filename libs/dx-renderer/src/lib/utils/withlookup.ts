import { EditLayoutItem } from "@ballware/meta-model";
import { AutocompleteStoreDescriptor, EditService, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { compileGetter } from 'devextreme/utils';
import { combineLatest, takeUntil } from "rxjs";
import { createArrayDatasource, createAutocompleteDataSource, createLookupDataSource } from "./datasource";
import { HasDestroy } from "./hasdestroy";
import { HasLookup } from "./haslookup";

type Constructor<T> = new(...args: any[]) => T;

export function WithLookup<T extends Constructor<HasDestroy>>(Base: T = (class {} as any)) {
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

      initLookup(layoutItem: EditLayoutItem, editService: EditService, lookupService: LookupService): void {

        combineLatest([editService.getValue$, lookupService.lookups$])
              .pipe(takeUntil(this.destroy$))
              .subscribe(([getValue, lookups]) => {
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
                          () => (currentLookup.store as LookupStoreDescriptor).listFunc(),
                          (id) => (currentLookup.store as LookupStoreDescriptor).byIdFunc(id)
                        );
                      } else if (currentLookup.type === 'autocomplete') {
                        this.dataSource = createAutocompleteDataSource(
                          () => (currentLookup.store as AutocompleteStoreDescriptor).listFunc()
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
              });
      }

      initStaticLookup(layoutItem: EditLayoutItem, editService: EditService) {
        combineLatest([editService.getValue$])
              .pipe(takeUntil(this.destroy$))
              .subscribe(([getValue]) => {
                if (getValue) {
                  this.dataSource = createArrayDatasource(layoutItem?.options?.items ?? (layoutItem?.options?.itemsMember ? getValue({ dataMember: layoutItem?.options?.itemsMember }) as any[] : []));

                  this.hasLookupItemHintValue = !!layoutItem?.options?.hintExpr;

                  const keyValueGetter = compileGetter(layoutItem.options?.valueExpr ?? this.dataSource?.key() ?? 'Id');

                  this.lookupItemKeyValueGetter = (item) => keyValueGetter(item);

                  const displayValueGetter = compileGetter(layoutItem?.options?.displayExpr ?? 'Name');                
          
                  this.lookupItemDisplayValueGetter = (item) => displayValueGetter(item);
          
                  const hintValueGetter = layoutItem?.options?.hintExpr ? compileGetter(layoutItem.options.hintExpr) : undefined;
          
                  this.lookupItemHintValueGetter = hintValueGetter ? (item) => hintValueGetter(item) : undefined;                  
                }
              });
      }
    }
}
