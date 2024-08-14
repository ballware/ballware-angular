import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface Notification {
    message: string;
    severity: 'info'|'warning'|'error';
}

export interface NotificationService {

    notification$: Observable<Notification|undefined>;    

    triggerNotification(notification: Notification): void;
    hideNotification(): void;
}

export const NOTIFICATION_SERVICE = new InjectionToken<NotificationService>('Notification service');