import { InjectionToken, OnDestroy } from '@angular/core';
import { CrudItem, EditLayout, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { EditModes } from './editmodes';
import { MetaService } from './meta.service';
import { Router } from '@angular/router';

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

export interface CrudService extends OnDestroy {

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

    queryIdentifier$: Observable<string|undefined>;
    reload$: Observable<void>;

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

export type CrudServiceFactory = (router: Router, metaService: MetaService) => CrudService;

export const CRUD_SERVICE = new InjectionToken<CrudService>('Crud service');
export const CRUD_SERVICE_FACTORY = new InjectionToken<CrudServiceFactory>('Crud service factory');
