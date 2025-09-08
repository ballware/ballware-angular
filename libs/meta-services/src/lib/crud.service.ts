import { InjectionToken, OnDestroy } from '@angular/core';
import { CrudItem, EditLayout, EditUtil, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
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

export interface ItemEditOperation {
    mode: EditModes,
    entity: string,
    item: unknown,
    title: string,
    supportContinueAfterSave: boolean,
    editLayout?: EditLayout,
    externalEditor?: boolean,
    foreignEntity?: string,
    customFunction?: EntityCustomFunction
}

export interface ItemRemoveOperation {
    item: Record<string, unknown>,
    title: string
}

export interface CrudEditMenuItem {
    id: string,
    text: string,
    icon?: string,
    customFunction?: EntityCustomFunction
}

export interface ImportOperation {
    importFunction: EntityCustomFunction
}

export interface DetailColumnEditOperation {
    mode: EditModes,
    entity: string,
    originalItem: unknown,
    editableItem: unknown,
    dataMember: string,
    title: string,
    editLayout: EditLayout,
    column: GridLayoutColumn
}

export interface CrudService extends OnDestroy {

    currentInteractionTarget$: Observable<Element|undefined>;

    functionAllowed$: Observable<((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined>;
    functionExecute$: Observable<((button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => void)|undefined>;

    addMenuItems$: Observable<CrudEditMenuItem[]|undefined>;

    headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

    exportMenuItems$: Observable<CrudEditMenuItem[]|undefined>;
    importMenuItems$: Observable<CrudEditMenuItem[]|undefined>;

    editOperation$: Observable<ItemEditOperation|undefined>;
    removeOperation$: Observable<ItemRemoveOperation|undefined>;
    importOperation$: Observable<ImportOperation|undefined>;

    detailColumnEditOperation$: Observable<DetailColumnEditOperation|undefined>;

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

    save(request: { customFunction: EntityCustomFunction, item: CrudItem, continueAfterSave: boolean }): void;
    saveBatch(request: { customFunction: EntityCustomFunction, items: CrudItem[], continueAfterSave: boolean }): void;

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

    applyEdit(request: { item: Record<string, unknown>, continueAfterSave: boolean, editUtil: EditUtil, customFunction?: EntityCustomFunction }): void;
    cancelEdit(): void;

    applyRemove(request: { item: Record<string, unknown> }): void;
    cancelRemove(): void;

    applyImport(request: { file: File, customFunction: EntityCustomFunction }): void;
    cancelImport(): void;

    applyDetailColumnEdit(request: { originalItem: Record<string, unknown>, editedItem: Record<string, unknown>, column: GridLayoutColumn }): void;
    cancelDetailColumnEdit(): void;
}

export interface CrudOperator {
  readonly kind: string;
  registerService(service: CrudService): void;
}

export type CrudServiceFactory = (router: Router, metaService: MetaService, crudOperator: CrudOperator) => CrudService;

export const CRUD_SERVICE = new InjectionToken<CrudService>('Crud service');
export const CRUD_SERVICE_FACTORY = new InjectionToken<CrudServiceFactory>('Crud service factory');

export type CrudOperatorFactory = (router: Router, parentOperator?: CrudOperator) => CrudOperator;

export const CRUD_OPERATOR = new InjectionToken<CrudOperator>('Crud operator');
export const CRUD_OPERATOR_FACTORY = new InjectionToken<CrudOperatorFactory>('Crud operator factory');
