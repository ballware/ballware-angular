import { createReducer, on } from "@ngrx/store";
import { toolbarDocumentationFetched, toolbarHideDocumentation, toolbarSetPage } from "./toolbar.actions";
import { ToolbarState } from "./toolbar.state";

const initialToolbarState = {

} as ToolbarState;

export const toolbarReducer = createReducer(
    initialToolbarState, 
    on(toolbarSetPage, (state, { title, documentationIdentifier }) => ({ 
        ...state,
        title,
        documentationIdentifier
    })),
    on(toolbarDocumentationFetched, (state, { documentation }) => ({
        ...state,
        documentation
    })),
    on(toolbarHideDocumentation, (state) => ({
        ...state,
        documentation: undefined
    }))
);