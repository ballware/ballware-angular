import { combineReducers, createReducer, on } from "@ngrx/store";
import { CrudState } from "../crud/crud.state";
import { EditState } from "../edit/edit.state";
import { LookupState } from "../lookup/lookup.state";
import { MetaState } from "../meta/meta.state";
import { PageState } from "../page/page.state";
import { crudDestroyed, crudUpdated, editDestroyed, editUpdated, lookupDestroyed, lookupUpdated, metaDestroyed, metaUpdated, pageDestroyed, pageUpdated } from "./component.actions";

export const componentReducer = combineReducers({
    lookup: createReducer(
        {} as Record<string, LookupState|undefined>,
        on(lookupUpdated, (state, { identifier, currentState }) => ({
            ...state,
            [identifier]: currentState
        })),
        on(lookupDestroyed, (state, { identifier }) => ({
            ...state,
            [identifier]: undefined
        })),
    ),
    page: createReducer(
        {} as Record<string, PageState|undefined>,
        on(pageUpdated, (state, { identifier, currentState }) => ({
            ...state,
            [identifier]: currentState
        })),
        on(pageDestroyed, (state, { identifier }) => ({
            ...state,
            [identifier]: undefined
        })),
    ),    
    meta: createReducer(
        {} as Record<string, MetaState|undefined>,
        on(metaUpdated, (state, { identifier, currentState }) => ({
            ...state,
            [identifier]: currentState
        })),
        on(metaDestroyed, (state, { identifier }) => ({
            ...state,
            [identifier]: undefined
        })),
    ),
    crud: createReducer(
        {} as Record<string, CrudState|undefined>,
        on(crudUpdated, (state, { identifier, currentState }) => ({
            ...state,
            [identifier]: currentState
        })),
        on(crudDestroyed, (state, { identifier }) => ({
            ...state,
            [identifier]: undefined
        })),
    ),
    edit: createReducer(
        {} as Record<string, EditState|undefined>,
        on(editUpdated, (state, { identifier, currentState }) => ({
            ...state,
            [identifier]: currentState
        })),
        on(editDestroyed, (state, { identifier }) => ({
            ...state,
            [identifier]: undefined
        })),
    )
});