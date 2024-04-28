import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { ToolbarService } from "../toolbar.service";
import { toolbarHideDocumentation, toolbarSetPage, toolbarShowDocumentation } from "./toolbar.actions";
import { selectDocumentation, selectDocumentationIdentifier, selectTitle } from "./toolbar.state";

@Injectable()
export class ToolbarServiceProxy extends ToolbarService {

    constructor(private store: Store) {
        super();
    }
    
    public get title$() {
        return this.store.select(selectTitle);
    }

    public get documentationIdentifier$() {
        return this.store.select(selectDocumentationIdentifier);
    }

    public get documentation$() {
        return this.store.select(selectDocumentation);
    }

    public override setPage(title: string, documentationIdentifier?: string): void {
        this.store.dispatch(toolbarSetPage({ title, documentationIdentifier }));
    }

    public override showDocumentation(): void {
        this.store.dispatch(toolbarShowDocumentation());
    }

    public override hideDocumentation(): void {
        this.store.dispatch(toolbarHideDocumentation());
    }
}