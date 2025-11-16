import { Component, DestroyRef, Inject } from '@angular/core';
import { NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import notify from 'devextreme/ui/notify';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-notification',
  template: '',
  styleUrls: [],
  imports: [CommonModule],
  standalone: true
})
export class ApplicationNotificationComponent {

  constructor(
    private destroy: DestroyRef,
    @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService) {


    this.notificationService.notification$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(notification => {
      if (notification) {
        notify(notification.message, notification.severity);

        this.notificationService.hideNotification();
      }
    });
  }
}

