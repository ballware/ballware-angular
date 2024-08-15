import { createFeatureSelector, createSelector } from "@ngrx/store";

export const toolbarFeatureKey = "toolbar";

export interface ToolbarState {
    title?: string,
    documentationIdentifier?: string,
    documentation: unknown
}

const selectToolbarFeature = createFeatureSelector<ToolbarState>(toolbarFeatureKey);

export const selectTitle = createSelector(selectToolbarFeature, (state: ToolbarState) => state.title);
export const selectDocumentationIdentifier = createSelector(selectToolbarFeature, (state: ToolbarState) => state.documentationIdentifier);
export const selectDocumentation = createSelector(selectToolbarFeature, (state: ToolbarState) => state.documentation);