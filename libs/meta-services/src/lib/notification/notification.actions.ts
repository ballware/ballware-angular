import { createAction, props } from "@ngrx/store";
import { Notification } from "../notification.service";

export const showNotification = createAction('[Notification] triggered', props<{
    notification: Notification
}>());

export const hideNotification = createAction('[Notification] hidden');