import { Component } from '@angular/core';
import { NotificationService } from '@ballware/meta-services';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: []
})
export class ApplicationNotificationComponent extends WithDestroy() {
    
  constructor(private notificationService: NotificationService) {    
    super();

    this.notificationService.notification$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
          if (notification) {
            notify(notification.message, notification.severity);

            this.notificationService.hideNotification();
          }          
      });
  }
}

