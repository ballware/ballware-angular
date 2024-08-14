import { Store } from "@ngrx/store";
import { Notification, NotificationService } from "../notification.service";
import { showNotification, hideNotification } from "./notification.actions";
import { selectNotification } from "./notification.state";

export class NotificationServiceProxy implements NotificationService {
    constructor(private store: Store) {}

    public get notification$() {
        return this.store.select(selectNotification);
    }

    public triggerNotification(notification: Notification): void {
        this.store.dispatch(showNotification({ notification }));
    }

    public hideNotification(): void {
        this.store.dispatch(hideNotification());
    }
}