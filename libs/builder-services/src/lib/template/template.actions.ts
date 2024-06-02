import { Template } from "@ballware/meta-model";
import { createAction, props } from "@ngrx/store";

export const templateCreate = createAction('[Template] Create');
export const templateOpen = createAction('[Template] Open', props<{ file: File }>());
export const templateOpened = createAction('[Template] Opened', props<{ template: Template }>());
export const templateDownload = createAction('[Template] Download');
export const templateClose = createAction('[Template] Close');