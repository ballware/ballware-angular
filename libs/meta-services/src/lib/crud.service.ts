import { Observable } from 'rxjs';
import { CrudItem, EditLayout, EntityCustomFunction } from '@ballware/meta-model';
import { EditModes } from './editmodes';
import { WithDestroy } from './withdestroy';

export type FunctionIdentifier = 'add' | 'edit' | 'view' | 'delete' | 'print' | 'options' | 'customoptions';

export abstract class CrudService extends WithDestroy() {

  public abstract functionAllowed$: Observable<((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined>;
  public abstract functionExecute$: Observable<((button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => void)|undefined>;

  public abstract addMenuItems$: Observable<{id: string, text: string, customFunction?: EntityCustomFunction}[]|undefined>;
  public abstract headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

  public abstract exportMenuItems$: Observable<{id: string, text: string, customFunction: EntityCustomFunction}[]|undefined>;
  public abstract importMenuItems$: Observable<{id: string, text: string, customFunction: EntityCustomFunction}[]|undefined>;

  public abstract itemDialog$: Observable<{ mode: EditModes, item: Record<string, unknown>, title: string, editLayout?: EditLayout, apply: (item: Record<string, unknown>) => void, cancel: () => void}|undefined>;
  public abstract removeDialog$: Observable<{ item: CrudItem, title: string }|undefined>;

  public abstract selectAddSheet$: Observable<{
    target: Element,
    actions: {
      id: string,
      text: string,
      icon: string,
      target: Element,
      execute: (target: Element) => void
    }[]
  }|undefined>;

  public abstract selectActionSheet$: Observable<{ item: CrudItem, target: Element, actions: {
    id: string,
    text: string,
    icon: string,
    item: CrudItem,
    target: Element,
    execute: (target: Element) => void
  }[]}|undefined>;

  public abstract selectPrintSheet$: Observable<{ item: CrudItem, target: Element, actions: {
    id: string,
    text: string,
    icon: string,
    item: CrudItem,
    target: Element,
    execute: (target: Element) => void
  }[]}|undefined>;

  public abstract fetchedItems$: Observable<CrudItem[]|undefined>;

  public abstract setQuery(query: string): void;
  public abstract setStorageIdentifier(identifier: string): void;

  public abstract reload(): void;
  public abstract create(editLayout: string): void;
  public abstract view(item: CrudItem, editLayout: string): void;
  public abstract edit(item: CrudItem, editLayout: string): void;
  public abstract remove(item: CrudItem): void;
  public abstract print(documentId: string, items: CrudItem[]): void;
  public abstract customEdit(customFunction: EntityCustomFunction, items?: CrudItem[]): void;

  public abstract selectAdd(target: Element, defaultEditLayout: string): void;
  public abstract selectPrint(item: CrudItem, target: Element): void;
  public abstract selectOptions(item: CrudItem, target: Element, defaultEditLayout: string): void;
  public abstract selectCustomOptions(item: CrudItem, target: Element, defaultEditLayout: string): void;
}
