import { Injectable, OnDestroy } from '@angular/core';
import { EditLayout, EditLayoutItem, ValueType } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { EditItemRef } from './edititemref';
import { EditModes } from './editmodes';

export interface EditServiceApi {
    item$: Observable<Record<string, unknown>|undefined>;
    mode$: Observable<EditModes|undefined>;
    editLayout$: Observable<EditLayout|undefined>;
    readonly$: Observable<boolean|undefined>;

    getValue$: Observable<((request: { dataMember: string }) => unknown)|undefined>;
    setValue$: Observable<((request: { dataMember: string, value: unknown }) => void)|undefined>;
    
    editorPreparing$: Observable<((request: { dataMember: string, layoutItem: EditLayoutItem }) => void)|undefined>;
    editorInitialized$: Observable<((request: { dataMember: string, ref: EditItemRef }) => void)|undefined>;
    editorValidating$: Observable<((request: { dataMember: string, ruleIdentifier: string, value: ValueType }) => boolean)|undefined>;
    editorValueChanged$: Observable<((request: { dataMember: string, value: ValueType, notify: boolean }) => void)|undefined>;
    editorEntered$: Observable<((request: { dataMember: string }) => void)|undefined>;
    editorEvent$: Observable<((request: { dataMember: string, event: string }) => void)|undefined>;    

    setIdentifier(identifier: string): void;

    setMode(mode: EditModes): void;  
    setItem(item: Record<string, unknown>): void;  
    setEditLayout(editLayout: EditLayout): void;
  
    setValidator(validator: (() => boolean)): void;  
    validate(): Observable<boolean>;
}

@Injectable()
export abstract class EditService implements OnDestroy, EditServiceApi {
    
    public abstract ngOnDestroy(): void;

    public abstract setIdentifier(identifier: string): void;

    public abstract item$: Observable<Record<string, unknown>|undefined>;
    public abstract mode$: Observable<EditModes|undefined>;
    public abstract editLayout$: Observable<EditLayout|undefined>;
    public abstract readonly$: Observable<boolean|undefined>;

    public abstract getValue$: Observable<((request: { dataMember: string }) => unknown)|undefined>;
    public abstract setValue$: Observable<((request: { dataMember: string, value: unknown }) => void)|undefined>;

    public abstract editorPreparing$: Observable<((request: { dataMember: string, layoutItem: EditLayoutItem }) => void)|undefined>;
    public abstract editorInitialized$: Observable<((request: { dataMember: string, ref: EditItemRef }) => void)|undefined>;
    public abstract editorValidating$: Observable<((request: { dataMember: string, ruleIdentifier: string, value: ValueType }) => boolean)|undefined>;
    public abstract editorValueChanged$: Observable<((request: { dataMember: string, value: ValueType, notify: boolean }) => void)|undefined>;
    public abstract editorEntered$: Observable<((request: { dataMember: string }) => void)|undefined>;
    public abstract editorEvent$: Observable<((request: { dataMember: string, event: string }) => void)|undefined>;    
 
    public abstract setMode(mode: EditModes): void;  
    public abstract setItem(item: Record<string, unknown>): void;  
    public abstract setEditLayout(editLayout: EditLayout): void;
  
    public abstract setValidator(validator: (() => boolean)|undefined): void;  
    public abstract validate(): Observable<boolean>;
}