import { Injectable, OnDestroy } from '@angular/core';
import { CrudItem, EditLayout, EntityCustomFunction } from '@ballware/meta-model';
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
    customFunction?: EntityCustomFunction
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

    save(request: { customFunction: EntityCustomFunction, item: CrudItem }): void;
    saveBatch(request: { customFunction: EntityCustomFunction, items: CrudItem[] }): void;

    drop(request: { item: CrudItem }): void;

    selectAdd(request: { target: Element, defaultEditLayout: string }): void;
    selectPrint(request: { items: CrudItem[], target: Element }): void;
    selectOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;
    selectCustomOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;  
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

  public abstract selectAdd(request: { target: Element, defaultEditLayout: string }): void;
  public abstract selectPrint(request: { items: CrudItem[], target: Element }): void;
  public abstract selectOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;
  public abstract selectCustomOptions(request: { item: CrudItem, target: Element, defaultEditLayout: string }): void;  
}
