import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SCREEN_SIZE } from "../responsive.service";

export const responsiveFeatureKey = "responsive";

export interface ResponsiveState {
    size: SCREEN_SIZE
}

const selectResponsiveFeature = createFeatureSelector<ResponsiveState>(responsiveFeatureKey);

export const selectSize = createSelector(selectResponsiveFeature, (state: ResponsiveState) => state.size);
export const selectSmallScreen = createSelector(selectResponsiveFeature, (state: ResponsiveState) => state.size <= SCREEN_SIZE.SM);