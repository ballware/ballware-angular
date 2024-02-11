import { Injectable, OnDestroy } from "@angular/core";
import { MetaService } from "../meta.service";
import { MetaStore } from "./meta.store";

@Injectable()
export class MetaServiceProxy extends MetaService implements OnDestroy {

    constructor(private metaStore: MetaStore) {
        super();
    }

    ngOnDestroy(): void {
        this.metaStore.ngOnDestroy();
    }

    public override setIdentifier = this.metaStore.setIdentifier;

    public override setEntity = this.metaStore.setEntity;
    public override setReadOnly = this.metaStore.setReadOnly;
    public override setHeadParams = this.metaStore.setHeadParams;
    public override setInitialCustomParam = this.metaStore.setInitialCustomParam;

    public override headParams$ = this.metaStore.headParams$;
    public override customParam$ = this.metaStore.customParam$;

    public override displayName$ = this.metaStore.displayName$;
    public override entityMetadata$ = this.metaStore.entityMetadata$;
    public override entityDocuments$ = this.metaStore.entityDocuments$;
    public override entityTemplates$ = this.metaStore.entityTemplates$;
    public override customFunctions$ = this.metaStore.customFunctions$;

    public override addFunction$ = this.metaStore.addFunction$;
    public override viewFunction$ = this.metaStore.viewFunction$;
    public override editFunction$ = this.metaStore.editFunction$;

    public override prepareCustomFunction$ = this.metaStore.prepareCustomFunction$;
    public override evaluateCustomFunction$ = this.metaStore.evaluateCustomFunction$;

    public override getGridLayout$ = this.metaStore.getGridLayout$;
    public override getEditLayout$ = this.metaStore.getEditLayout$;

    public override query$ = this.metaStore.query$;
    public override count$ = this.metaStore.count$;

    public override byId$ = this.metaStore.byId$;
    public override create$ = this.metaStore.create$;
 
    public override save$ = this.metaStore.save$;
    public override saveBatch$ = this.metaStore.saveBatch$;
    public override drop$ = this.metaStore.drop$;

    public override exportItems$ = this.metaStore.exportItems$;
    public override importItems$ = this.metaStore.importItems$;

    public override dropAllowed$ = this.metaStore.dropAllowed$;
    public override printAllowed$ = this.metaStore.printAllowed$;
    public override customFunctionAllowed$ = this.metaStore.customFunctionAllowed$;

    public override editorPreparing$ = this.metaStore.editorPreparing$;
    public override editorInitialized$ = this.metaStore.editorInitialized$;
    public override editorEntered$ = this.metaStore.editorEntered$;
    public override editorValueChanged$ = this.metaStore.editorValueChanged$;
    public override editorValidating$ = this.metaStore.editorValidating$;    
    public override editorEvent$ = this.metaStore.editorEvent$;

    public override detailGridCellPreparing$ = this.metaStore.detailGridCellPreparing$;
    public override detailGridRowValidating$ = this.metaStore.detailGridRowValidating$;
    public override initNewDetailItem$ = this.metaStore.initNewDetailItem$;
  
}