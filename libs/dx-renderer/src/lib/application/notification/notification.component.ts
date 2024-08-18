import { Component, Inject } from '@angular/core';
import { NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-notification',
  template: '',
  styleUrls: [],
  imports: [CommonModule],
  standalone: true
})
export class ApplicationNotificationComponent extends WithDestroy() {
    
  constructor(@Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService) {    
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

