import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for notification operations
 */
export interface MetaNotificationApi extends SelectableMetaApi {

}

export const META_NOTIFICATION_API = new InjectionToken<MetaNotificationApi>('Meta notification api');
