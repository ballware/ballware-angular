import { Store } from "@ngrx/store";
import { ToolbarService } from "@ballware/meta-services";
import { toolbarHideDocumentation, toolbarSetPage, toolbarShowDocumentation } from "./toolbar.actions";
import { selectDocumentation, selectDocumentationIdentifier, selectTitle } from "./toolbar.state";

export class ToolbarServiceProxy implements ToolbarService {

    constructor(private store: Store) {}
    
    public get title$() {
        return this.store.select(selectTitle);
    }

    public get documentationIdentifier$() {
        return this.store.select(selectDocumentationIdentifier);
    }

    public get documentation$() {
        return this.store.select(selectDocumentation);
    }

    public setPage(title: string, documentationIdentifier?: string): void {
        this.store.dispatch(toolbarSetPage({ title, documentationIdentifier }));
    }

    public showDocumentation(): void {
        this.store.dispatch(toolbarShowDocumentation());
    }

    public hideDocumentation(): void {
        this.store.dispatch(toolbarHideDocumentation());
    }
}