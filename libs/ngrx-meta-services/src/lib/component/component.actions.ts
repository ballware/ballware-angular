import { createAction, props } from "@ngrx/store";
import { AttachmentState } from "../attachment/attachment.state";
import { CrudState } from "../crud/crud.state";
import { EditState } from "../edit/edit.state";
import { LookupState } from "../lookup/lookup.state";
import { MetaState } from "../meta/meta.state";
import { PageState } from "../page/page.state";
import { StatisticState } from "../statistic/statistic.state";

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

export const statisticUpdated = createAction('[Statistic] updated', props<{    
    identifier: string,
    currentState: StatisticState|undefined
}>());

export const statisticDestroyed = createAction('[Statistic] destroyed', props<{    
    identifier: string
}>());

export const attachmentUpdated = createAction('[Attachment] updated', props<{    
    identifier: string,
    currentState: AttachmentState|undefined
}>());

export const attachmentDestroyed = createAction('[Attachment] destroyed', props<{    
    identifier: string
}>());