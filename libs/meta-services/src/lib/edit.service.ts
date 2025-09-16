import { InjectionToken, OnDestroy } from '@angular/core';
import { EditLayout, EditLayoutItem, EditUtil, GridLayoutColumn, ValueType } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { EditItemRef } from './edititemref';
import { EditModes } from './editmodes';
import { MetaService } from './meta.service';

export interface EditService extends OnDestroy {
    item$: Observable<Record<string, unknown>|undefined>;
    mode$: Observable<EditModes|undefined>;
    entity$: Observable<string|undefined>;
    editLayout$: Observable<EditLayout|undefined>;
    readonly$: Observable<boolean|undefined>;

    getValue$: Observable<((request: { dataMember: string }) => unknown)|undefined>;
    setValue$: Observable<((request: { dataMember: string, value: unknown }) => void)|undefined>;

    editorPreparing$: Observable<((request: { dataMember: string, layoutItem: EditLayoutItem }) => void)|undefined>;
    editorInitialized$: Observable<((request: { dataMember: string, ref: EditItemRef }) => void)|undefined>;
    editorValidating$: Observable<((request: { dataMember: string, ruleIdentifier: string, value: ValueType }) => Observable<boolean>)|undefined>;
    editorValueChanged$: Observable<((request: { dataMember: string, value: ValueType, notify: boolean }) => void)|undefined>;
    editorEntered$: Observable<((request: { dataMember: string }) => void)|undefined>;
    editorEvent$: Observable<((request: { dataMember: string, event: string }) => void)|undefined>;

    detailGridCellPreparing$: Observable<((request: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, options: GridLayoutColumn }) => void) | undefined>;
    detailGridRowValidating$: Observable<((request: { dataMember: string, detailItem: Record<string, unknown> }) => Observable<string|undefined>) | undefined>;
    initNewDetailItem$: Observable<((request: { dataMember: string, detailItem: Record<string, unknown> }) => void) | undefined>;

    detailEditorInitialized$: Observable<((request: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, component: EditItemRef }) => void)|undefined>;
    detailEditorValidating$: Observable<((request: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, ruleIdentifier: string, value: ValueType }) => Observable<boolean>)|undefined>;
    detailEditorEntered$: Observable<((request: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string }) => void)|undefined>;
    detailEditorEvent$: Observable<((request: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, event: string }) => void)|undefined>;
    detailEditorValueChanged$: Observable<((request: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, value: unknown, notify: boolean }) => void) | undefined>;

    validator$: Observable<(() => Observable<boolean>)|undefined>;

    setIdentifier(identifier: string): void;

    setMode(mode: EditModes): void;
    setEntity(entity: string): void;
    setItem(item: Record<string, unknown>): void;
    setEditLayout(editLayout: EditLayout): void;
    setApply(applyMethod: (editUtil: EditUtil, item: Record<string, unknown>, continueAfterSave: boolean) => void): void;
    setCancel(cancelMethod: () => void): void;

    setValidator(validator: (() => Observable<boolean>)|undefined): void;

    editUtil(): EditUtil;
}

export type EditServiceFactory = (metaService: MetaService) => EditService;

export const EDIT_SERVICE = new InjectionToken<EditService>('Edit service');
export const EDIT_SERVICE_FACTORY = new InjectionToken<EditServiceFactory>('Edit service factory');
