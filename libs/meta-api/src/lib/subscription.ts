import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for subscription operations
 */
 export interface MetaSubscriptionApi extends SelectableMetaApi {

  /**
   * Trigger subscriptions for given ids
   *
   * @param ids Collection of ids to trigger subscription for
   * @returns Observable resolving when subscription is triggered
   */
  triggerSubscriptions: (ids: Array<string>) => Observable<void>;
}

export const META_SUBSCRIPTION_API = new InjectionToken<MetaSubscriptionApi>('Meta subscription api');
