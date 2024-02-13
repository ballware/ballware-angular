import { createReducer, on } from "@ngrx/store";
import { NotificationState } from "./notification.state";
import { hideNotification, showNotification } from "./notification.actions";

const initialState = {
    
} as NotificationState;

export const notificationReducer = createReducer(
    initialState,     
    on(showNotification, (state, { notification }) => ({
        ...state,
        notification
    })),
    on(hideNotification, (state) => ({
        ...state,
        notification: undefined
    }))    
);