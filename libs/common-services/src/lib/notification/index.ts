import { StoreModule } from '@ngrx/store';
import { notificationReducer } from './notification.reducer';
import { notificationFeatureKey } from './notification.state';

export * from './notification.actions';
export { NotificationServiceProxy } from './notification.proxy';
export * from './notification.state';

export const NotificationFeatureModule = StoreModule.forFeature(notificationFeatureKey, notificationReducer);