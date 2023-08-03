import { Injectable } from "@angular/core";
import { MetaService } from "../meta.service";
import { MetaStore } from "./meta.store";

@Injectable()
export class MetaServiceProxy extends MetaService {

    constructor(private metaStore: MetaStore) {
        super();
    }

    public override setEntity = this.metaStore.setEntity;
    public override setReadOnly = this.metaStore.setReadOnly;
    public override setHeadParams = this.metaStore.setHeadParams;
    public override setInitialCustomParam = this.metaStore.setInitialCustomParam;

    public override headParams$ = this.metaStore.headParams$;
    public override customParam$ = this.metaStore.customParam$;

    public override displayName$ = this.metaStore.displayName$;
    public override entityMetadata$ = this.metaStore.entityMetadata$;
    public override entityDocuments$ = this.metaStore.entityDocuments$;
    public override customFunctions$ = this.metaStore.customFunctions$;

    public override prepareCustomFunction$ = this.metaStore.prepareCustomFunction$;
    public override evaluateCustomFunction$ = this.metaStore.evaluateCustomFunction$;

    public override getGridLayout$ = this.metaStore.getGridLayout$;
    public override getEditLayout$ = this.metaStore.getEditLayout$;

    public override query$ = this.metaStore.query$;
    public override count$ = this.metaStore.count$;

    public override byId$ = this.metaStore.byId$;
    public override create$ = this.metaStore.create$;

    public override addAllowed$ = this.metaStore.addAllowed$;
    public override viewAllowed$ = this.metaStore.viewAllowed$;
    public override editAllowed$ = this.metaStore.editAllowed$;
    public override dropAllowed$ = this.metaStore.dropAllowed$;
    public override printAllowed$ = this.metaStore.printAllowed$;
    public override customFunctionAllowed$ = this.metaStore.customFunctionAllowed$;

    public override editorPreparing$ = this.metaStore.editorPreparing$;
    public override editorInitialized$ = this.metaStore.editorInitialized$;
    public override editorEntered$ = this.metaStore.editorEntered$;
    public override editorValueChanged$ = this.metaStore.editorValueChanged$;
    public override editorValidating$ = this.metaStore.editorValidating$;    
    public override editorEvent$ = this.metaStore.editorEvent$;
}