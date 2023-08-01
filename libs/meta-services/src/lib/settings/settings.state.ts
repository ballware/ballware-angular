import { createFeatureSelector, createSelector } from "@ngrx/store";

export const settingsFeatureKey = "settings";

export interface SettingsState {
    version?: string,
    googlekey?: string,
}

const selectSettingsFeature = createFeatureSelector<SettingsState>(settingsFeatureKey);

export const selectVersion = createSelector(selectSettingsFeature, (state: SettingsState) => state.version);
export const selectGooglekey = createSelector(selectSettingsFeature, (state: SettingsState) => state.googlekey);