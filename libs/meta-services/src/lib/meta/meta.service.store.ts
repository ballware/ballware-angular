import { Injectable } from "@angular/core";
import { MetaService } from "../meta.service";
import { QueryParams } from "@ballware/meta-model";
import { MetaStore } from "./meta.store";

@Injectable()
export class MetaServiceStore extends MetaService {

    constructor(private metaStore: MetaStore) {
        super();
    }

    public override setEntity = this.metaStore.updateEntity;
    public override setReadonly = this.metaStore.updateReadOnly;
    

    public override setHeadParams(headParams: QueryParams): void {
        this.metaStore.updateHeadParams(headParams);
    }

    public override setInitialCustomParam(customParam: Record<string, unknown> | undefined): void {
        this.metaStore.updateInitialCustomParam(customParam);
    }

    public override get headParams$() {
        return this.metaStore.headParams$;
    } 

    public override get customParam$() {
        return this.metaStore.customParam$;
    }

    public override get displayName$() {
        return this.metaStore.displayName$;
    }

    public override get entityMetadata$() {
        return this.metaStore.entityMetadata$;
    }

    public override get entityDocuments$() {
        return this.metaStore.entityDocuments$;
    }

    public override get customFunctions$() {
        return this.metaStore.customFunctions$;
    }

    public override get prepareCustomFunction$() {
       return this.metaStore.prepareCustomFunction$;
    }

    public override get evaluateCustomFunction$() {
        return this.metaStore.evaluateCustomFunction$;
    }

    public override get getGridLayout$() {
        return this.metaStore.getGridLayout$;
    }

    public override get getEditLayout$() {
        return this.metaStore.getEditLayout$;
    }

    public override get query$() {
        return this.metaStore.query$;
    }

    public override get count$() {
        return this.metaStore.count$;
    }

    public override get byId$() {
        return this.metaStore.byId$;
    }

    public override get create$() {
        return this.metaStore.create$;
    }

    public override get addAllowed$() {
        return this.metaStore.addAllowed$;
    }

    public override get viewAllowed$() {
        return this.metaStore.viewAllowed$;
    }

    public override get editAllowed$() {
        return this.metaStore.editAllowed$;
    }

    public override get dropAllowed$() {
        return this.metaStore.dropAllowed$;
    }

    public override get printAllowed$() {
        return this.metaStore.printAllowed$;
    }

    public override get customFunctionAllowed$() {
        return this.metaStore.customFunctionAllowed$;
    }

    public override get editorPreparing$() {
        return this.metaStore.editorPreparing$;
    }

    public override get editorInitialized$() {
        return this.metaStore.editorInitialized$;
    }

    public override get editorEntered$() {
        return this.metaStore.editorEntered$;
    }

    public override get editorValueChanged$() {
        return this.metaStore.editorValueChanged$;
    }

    public override get editorValidating$() {
        return this.metaStore.editorValidating$;
    }
    
    public override get editorEvent$() {
        return this.metaStore.editorEvent$;
    }
}