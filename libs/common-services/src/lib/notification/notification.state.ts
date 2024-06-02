import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Notification } from "../notification.service";

export const notificationFeatureKey = "notification";

export interface NotificationState {
    notification?: Notification
}

const selectNotificationFeature = createFeatureSelector<NotificationState>(notificationFeatureKey);

export const selectNotification = createSelector(selectNotificationFeature, (state: NotificationState) => state.notification);