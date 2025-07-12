import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for subscription operations
 */
 export interface MetaSubscriptionApi {
  /**
   * Fetch list for lookup
   *
   * @returns Observable containing result list of lookup query
   */
  selectList: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element for lookup by id
   *
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectById: (id: string) => Observable<Record<string, unknown>>;

  /**
   * Trigger subscriptions for given ids
   * 
   * @param ids Collection of ids to trigger subscription for
   * @returns Observable resolving when subscription is triggered
   */
  triggerSubscriptions: (ids: Array<string>) => Observable<void>;
}

export const META_SUBSCRIPTION_API = new InjectionToken<MetaSubscriptionApi>('Meta subscription api');