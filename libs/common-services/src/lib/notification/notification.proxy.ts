import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Notification, NotificationService } from "../notification.service";
import { showNotification, hideNotification } from "./notification.actions";
import { selectNotification } from "./notification.state";

@Injectable()
export class NotificationServiceProxy extends NotificationService {
    constructor(private store: Store) {
        super();
    }

    public get notification$() {
        return this.store.select(selectNotification);
    }

    public override triggerNotification(notification: Notification): void {
        this.store.dispatch(showNotification({ notification }));
    }

    public override hideNotification(): void {
        this.store.dispatch(hideNotification());
    }
}