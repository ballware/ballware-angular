import { Injectable, OnDestroy } from "@angular/core";
import { EditService } from "../edit.service";
import { EditStore } from "./edit.store";

@Injectable()
export class EditServiceProxy extends EditService implements OnDestroy {
    
    constructor(private editStore: EditStore) {
        super();
    }

    ngOnDestroy(): void {
        this.editStore.ngOnDestroy();    
    }

    readonly setIdentifier = this.editStore.setIdentifier;

    readonly item$ = this.editStore.item$;
    readonly mode$ = this.editStore.mode$;
    readonly editLayout$ = this.editStore.editLayout$;
    readonly readonly$ = this.editStore.readonly$;
    readonly getValue$ = this.editStore.getValue$;
    readonly setValue$ = this.editStore.setValue$;
    readonly editorPreparing$ = this.editStore.editorPreparing$;
    readonly editorInitialized$ = this.editStore.editorInitialized$;
    readonly editorValidating$ = this.editStore.editorValidating$;
    readonly editorValueChanged$ = this.editStore.editorValueChanged$;
    readonly editorEntered$ = this.editStore.editorEntered$;
    readonly editorEvent$ = this.editStore.editorEvent$;

    readonly detailGridCellPreparing$ = this.editStore.detailGridCellPreparing$;
    readonly detailGridRowValidating$ = this.editStore.detailGridRowValidating$;
    readonly initNewDetailItem$ = this.editStore.initNewDetailItem$; 

    readonly detailEditorInitialized$ = this.editStore.detailEditorInitialized$; 
    readonly detailEditorValidating$ = this.editStore.detailEditorValidating$; 
    readonly detailEditorEntered$ = this.editStore.detailEditorEntered$; 
    readonly detailEditorEvent$ = this.editStore.detailEditorEvent$; 
    readonly detailEditorValueChanged$ = this.editStore.detailEditorValueChanged$; 

    readonly validator$ = this.editStore.validator$;
    
    readonly setMode = this.editStore.setMode;
    readonly setItem = this.editStore.setItem;
    readonly setEditLayout = this.editStore.setEditLayout;
    readonly setValidator = this.editStore.setValidator;
}