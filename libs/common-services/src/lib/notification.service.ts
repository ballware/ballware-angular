import { WithDestroy } from "@ballware/angular-utils";
import { Observable } from "rxjs";

export interface Notification {
    message: string;
    severity: 'info'|'warning'|'error';
}

export abstract class NotificationService extends WithDestroy() {

    public abstract notification$: Observable<Notification|undefined>;    

    public abstract triggerNotification(notification: Notification): void;
    public abstract hideNotification(): void;
}