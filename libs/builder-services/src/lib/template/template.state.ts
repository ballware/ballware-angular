import { createFeatureSelector, createSelector } from "@ngrx/store";

export const templateFeatureKey = "template";

export interface TemplateState {
    name?: string
}

const selectTemplateFeature = createFeatureSelector<TemplateState>(templateFeatureKey);

export const selectName = createSelector(selectTemplateFeature, (state: TemplateState) => state.name);