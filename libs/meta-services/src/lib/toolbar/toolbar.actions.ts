import { createAction, props } from "@ngrx/store";

export const toolbarSetPage = createAction('[Toolbar] Set page', props<{
    title?: string,
    documentationIdentifier?: string
}>());

export const toolbarShowDocumentation = createAction('[Toolbar] Show documentation');
export const toolbarHideDocumentation = createAction('[Toolbar] Hide documentation');

export const toolbarDocumentationFetched = createAction('[Toolbar] Documentation fetched', props<{    
    documentation: unknown
}>());