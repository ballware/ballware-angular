import { createAction, props } from "@ngrx/store";
import { SCREEN_SIZE } from "../responsive.service";

export const screenSizeChanged = createAction('[Responsive] screen size changed', props<{
    size: SCREEN_SIZE
}>());
