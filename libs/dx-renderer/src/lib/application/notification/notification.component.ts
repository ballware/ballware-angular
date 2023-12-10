import { Component } from '@angular/core';
import { WithDestroy } from '../../utils/withdestroy';
import { Notification, NotificationService } from '@ballware/meta-services';
import { Observable } from 'rxjs';

@Component({
  selector: 'ballware-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: []
})
export class ApplicationNotificationComponent extends WithDestroy() {
  
  public notification$: Observable<Notification|undefined>;

  constructor(private notificationService: NotificationService) {    
    super();

    this.notification$ = this.notificationService.notification$;
  }

  public hideNotification() {
    this.notificationService.hideNotification();
  }
}

