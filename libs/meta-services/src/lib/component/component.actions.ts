import { createAction, props } from "@ngrx/store";
import { CrudState } from "../crud/crud.state";
import { EditState } from "../edit/edit.state";
import { LookupState } from "../lookup/lookup.state";
import { MetaState } from "../meta/meta.state";
import { PageState } from "../page/page.state";

export const lookupUpdated = createAction('[Lookup] updated', props<{    
    identifier: string,
    currentState: LookupState|undefined
}>());

export const lookupDestroyed = createAction('[Lookup] destroyed', props<{    
    identifier: string
}>());

export const pageUpdated = createAction('[Page] updated', props<{    
    identifier: string,
    currentState: PageState|undefined
}>());

export const pageDestroyed = createAction('[Page] destroyed', props<{    
    identifier: string
}>());

export const metaUpdated = createAction('[Meta] updated', props<{    
    identifier: string,
    currentState: MetaState|undefined
}>());

export const metaDestroyed = createAction('[Meta] destroyed', props<{    
    identifier: string
}>());

export const crudUpdated = createAction('[Crud] updated', props<{    
    identifier: string,
    currentState: CrudState|undefined
}>());

export const crudDestroyed = createAction('[Crud] destroyed', props<{    
    identifier: string
}>());

export const editUpdated = createAction('[Edit] updated', props<{    
    identifier: string,
    currentState: EditState|undefined
}>());

export const editDestroyed = createAction('[Edit] destroyed', props<{    
    identifier: string
}>());
