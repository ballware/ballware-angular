import { Component } from '@angular/core';
import { NotificationService } from '@ballware/common-services';

import { CommonModule } from '@angular/common';
import { WithDestroy } from '@ballware/angular-utils';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'lib-ballware-commons-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: []
})
export class BallwareNotificationComponent extends WithDestroy() {
    
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

