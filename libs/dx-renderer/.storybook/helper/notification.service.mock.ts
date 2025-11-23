import { Notification, NotificationService } from '@ballware/meta-services';
import { Mock, It } from 'moq.ts';
import { Subject } from 'rxjs';

/**
 * Creates a mocked NotificationService for Storybook stories
 * Uses moq.ts instead of jest for mocking
 */
export const createMockedNotificationService = () => {

  const notification$ = new Subject<Notification | undefined>();

  const triggerNotification = (notification: Notification) => {
    notification$.next(notification);
  };

  const hideNotification = () => {
    notification$.next(undefined);
  };

  const mock = new Mock<NotificationService>()
    .setup(instance => instance.notification$)
      .returns(notification$.asObservable())
    .setup(instance => instance.triggerNotification(It.IsAny()))
      .callback((interaction: any) => {
        const notification = interaction.args[0] as Notification;
        triggerNotification(notification);
      })
    .setup(instance => instance.hideNotification())
      .callback(() => hideNotification());

  return {
    mock,
    service: mock.object(),
    // Expose the subjects for manipulation in stories
    subjects: {
      notification$
    },
    // Expose the function for custom behavior if needed
    functions: {
      triggerNotification,
      hideNotification
    },
  };
};
