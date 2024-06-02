import { createReducer, on } from "@ngrx/store";
import { SCREEN_SIZE } from "../responsive.service";
import { screenSizeChanged } from "./responsive.actions";
import { ResponsiveState } from "./responsive.state";

const initialState = {
    size: SCREEN_SIZE.SM
} as ResponsiveState;

export const responsiveReducer = createReducer(
    initialState,     
    on(screenSizeChanged, (state, { size }) => ({
        ...state,
        size
    }))
);