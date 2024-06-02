import { createReducer, on } from "@ngrx/store";
import { templateCreate } from "./template.actions";
import { TemplateState } from "./template.state";

const initialState = {

} as TemplateState;

export const templateReducer = createReducer(
    initialState, 
    on(templateCreate, (state) => ({ 
        ...state,
        ...initialState
    }))
);