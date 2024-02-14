import { Injectable, OnDestroy } from '@angular/core';
import { CrudItem, EditLayout, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { EditModes } from './editmodes';

export type FunctionIdentifier = 'add' | 'edit' | 'view' | 'delete' | 'print' | 'options' | 'customoptions';

export interface CrudAction {
    id: string,
    text: string,
    icon: string,
    item?: CrudItem,
    execute: (target: Element) => void
}

export interface ItemEditDialog {
    mode: EditModes, 
    item: unknown, 
    title: string, 
    editLayout?: EditLayout, 
    externalEditor?: boolean,
    foreignEntity?: string,
    customFunction?: EntityCustomFunction,
    apply: (item: Record<string, unknown>) => void, 
    cancel: () => void    
}

export interface ItemRemoveDialog {
    item: Record<string, unknown>, 
    title: string, 
    apply: (item: Record<string, unknown>) => void, 
    cancel: () => void    
}

export interface CrudEditMenuItem {
    id: string, 
    text: string, 
    icon?: string,
    customFunction?: EntityCustomFunction
}

export interface ImportDialog {
    importFunction: EntityCustomFunction
    apply: (file: File) => void;
    cancel: () => void;   
}

export interface DetailColumnEditDialog {
    mode: EditModes,
    item: unknown, 
    dataMember: string,
    title: string, 
    editLayout: EditLayout, 
    apply: (item: Record<string, unknown>) => void, 
    cancel: () => void    
}

export interface CrudServiceApi {

    currentInteractionTarget$: Observable<Element|undefined>;

    functionAllowed$: Observable<((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined>;
    functionExecute$: Observable<((button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => void)|undefined>;

    addMenuItems$: Observable<CrudEditMenuItem[]|undefined>;

    headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

    exportMenuItems$: Observable<CrudEditMenuItem[]|undefined>;
    importMenuItems$: Observable<CrudEditMenuItem[]|undefined>;

    itemDialog$: Observable<ItemEditDialog|undefined>;
    removeDialog$: Observable<ItemRemoveDialog|undefined>;
    importDialog$: Observable<ImportDialog|undefined>;

    detailColumnEditDialog$: Observable<DetailColumnEditDialog|undefined>;

    selectAddSheet$: Observable<{
        actions: CrudAction[]
    }|undefined>;

    selectActionSheet$: Observable<{ 
        item: CrudItem, 
        actions: CrudAction[] 
    }|undefined>;

    selectPrintSheet$: Observable<{ 
        items: CrudItem[], 
        actions: CrudAction[]
    }|undefined>;

    selectExportSheet$: Observable<{ 
        items: CrudItem[], 
        actions: CrudAction[]
    }|undefined>;

    selectImportSheet$: Observable<{ 
        actions: CrudAction[]
    }|undefined>;

    fetchedItems$: Observable<CrudItem[]|undefined>;

    setQuery(query: string): void;
    setIdentifier(identifier: string): void;

    reload(): void;
    create(request: { editLayout: string }): void;
    view(request: { item: CrudItem, editLayout: string }): void;
    edit(request: { item: CrudItem, editLayout: string }): void;
    remove(request: { item: CrudItem }): void;
    print(request: { documentId: string, items: CrudItem[] }): void;
    customEdit(request: { customFunction: EntityCustomFunction, items?: CrudItem[] }): void;
    exportItems(request: { customFunction: EntityCustomFunction, items: CrudItem[] }): void;
    importItems(request: { customFunction: EntityCustomFunction }): void;

    detailColumnEdit(request: { mode: EditModes, item: unknown, column: GridLayoutColumn }): void;

    save(request: { customFunction: EntityCustomFunction, item: CrudItem }): void;
    saveBatch(request: { customFunction: EntityCustomFunction, items: CrudItem[] }): void;

    drop(request: { item: CrudItem }): void;

    selectAdd(request: { target: Element, defaultEditLayout: string }): void;    
    selectPrint(request: { items: CrudItem[], target: Element }): void;
    selectExport(request: { items: CrudItem[], target: Element }): void;
    selectImport(request: { target: Element }): void;
    selectOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;
    selectCustomOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void; 
        
    selectAddDone(): void;    
    selectPrintDone(): void;
    selectExportDone(): void;
    selectImportDone(): void;
    selectOptionsDone(): void;
}

@Injectable()
export abstract class CrudService implements OnDestroy, CrudServiceApi {
  
  public abstract ngOnDestroy(): void;

  public abstract currentInteractionTarget$: Observable<Element|undefined>;

  public abstract functionAllowed$: Observable<((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined>;
  public abstract functionExecute$: Observable<((button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => void)|undefined>;

  public abstract addMenuItems$: Observable<CrudEditMenuItem[]|undefined>;
  public abstract headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

  public abstract exportMenuItems$: Observable<CrudEditMenuItem[]|undefined>;
  public abstract importMenuItems$: Observable<CrudEditMenuItem[]|undefined>;

  public abstract itemDialog$: Observable<ItemEditDialog|undefined>;
  public abstract removeDialog$: Observable<ItemRemoveDialog|undefined>;
  public abstract importDialog$: Observable<ImportDialog|undefined>;

  public abstract detailColumnEditDialog$: Observable<DetailColumnEditDialog|undefined>;

  public abstract selectAddSheet$: Observable<{
      actions: CrudAction[]
  }|undefined>;

  public abstract selectActionSheet$: Observable<{ 
      item: CrudItem,       
      actions: CrudAction[]
  }|undefined>;

  public abstract selectPrintSheet$: Observable<{ 
      items: CrudItem[],       
      actions: CrudAction[]
  }|undefined>;

  public abstract selectExportSheet$: Observable<{ 
    items: CrudItem[]; 
    actions: CrudAction[]; 
  } | undefined>;
  
  public abstract selectImportSheet$: Observable<{ 
    actions: CrudAction[]; 
  } | undefined>;

  public abstract fetchedItems$: Observable<CrudItem[]|undefined>;

  public abstract setQuery(query: string): void;
  public abstract setIdentifier(identifier: string): void;

  public abstract reload(): void;
  public abstract create(request: { editLayout: string }): void;
  public abstract view(request: { item: CrudItem, editLayout: string }): void;
  public abstract edit(request: { item: CrudItem, editLayout: string }): void;
  public abstract remove(request: { item: CrudItem }): void;
  public abstract print(request: { documentId: string, items: CrudItem[] }): void;
  public abstract customEdit(request: { customFunction: EntityCustomFunction, items?: CrudItem[] }): void;
  public abstract save(request: { customFunction: EntityCustomFunction, item: CrudItem }): void;
  public abstract saveBatch(request: { customFunction: EntityCustomFunction, items: CrudItem[] }): void;
  public abstract drop(request: { item: CrudItem }): void;
  public abstract exportItems(request: { customFunction: EntityCustomFunction, items: CrudItem[] }): void;
  public abstract importItems(request: { customFunction: EntityCustomFunction }): void;

  public abstract detailColumnEdit(request: { mode: EditModes, item: unknown, column: GridLayoutColumn }): void;

  public abstract selectAdd(request: { target: Element, defaultEditLayout: string }): void;
  public abstract selectPrint(request: { items: CrudItem[], target: Element }): void;
  public abstract selectExport(request: { items: CrudItem[], target: Element }): void;
  public abstract selectImport(request: { target: Element }): void;
  public abstract selectOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;
  public abstract selectCustomOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;  

  public abstract selectAddDone(): void;    
  public abstract selectPrintDone(): void;
  public abstract selectExportDone(): void;
  public abstract selectImportDone(): void;
  public abstract selectOptionsDone(): void;
}
