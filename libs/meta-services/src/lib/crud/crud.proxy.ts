import { Injectable, OnDestroy } from "@angular/core";
import { CrudService } from "../crud.service";
import { CrudStore } from "./crud.store";

@Injectable()
export class CrudServiceProxy extends CrudService implements OnDestroy {
    constructor(private crudStore: CrudStore) {
        super();
    }

    ngOnDestroy(): void {
        this.crudStore.ngOnDestroy();    
    }

    readonly functionAllowed$ = this.crudStore.functionAllowed$;
    readonly functionExecute$ = this.crudStore.functionExecute$;
  
    readonly addMenuItems$ = this.crudStore.addMenuItems$;
    readonly headCustomFunctions$ = this.crudStore.headCustomFunctions$;
  
    readonly exportMenuItems$ = this.crudStore.exportMenuItems$;
    readonly importMenuItems$ = this.crudStore.importMenuItems$;
  
    readonly itemDialog$ = this.crudStore.itemDialog$;
    readonly removeDialog$ = this.crudStore.removeDialog$;
      
    readonly selectAddSheet$ = this.crudStore.selectAddSheet$;  
    readonly selectActionSheet$ = this.crudStore.selectActionSheet$;  
    readonly selectPrintSheet$ = this.crudStore.selectPrintSheet$;
  
    readonly fetchedItems$ = this.crudStore.fetchedItems$;
  
    readonly setQuery = this.crudStore.setQuery;
    readonly setIdentifier = this.crudStore.setIdentifier;
  
    readonly reload = this.crudStore.reload;
    readonly create = this.crudStore.create;
    readonly view = this.crudStore.view;
    readonly edit = this.crudStore.edit;
    readonly remove = this.crudStore.remove;
    readonly print = this.crudStore.print;
    readonly customEdit = this.crudStore.customEdit;

    readonly save = this.crudStore.save;
    readonly saveBatch = this.crudStore.saveBatch;
  
    readonly selectAdd = this.crudStore.selectAdd;
    readonly selectPrint = this.crudStore.selectPrint;
    readonly selectOptions = this.crudStore.selectOptions;
    readonly selectCustomOptions = this.crudStore.selectCustomOptions;
}