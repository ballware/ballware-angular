import { createReducer, on } from "@ngrx/store";
import { SettingsState } from "./settings.state";
import { settingsInitialize } from "./settings.actions";

const initialSettingsState = {

} as SettingsState;

export const settingsReducer = createReducer(
    initialSettingsState, 
    on(settingsInitialize, (state, { version, googlekey }) => ({ 
        ...state,
        version,
        googlekey
    }))
);