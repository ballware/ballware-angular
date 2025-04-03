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
}

export const META_SUBSCRIPTION_API = new InjectionToken<MetaSubscriptionApi>('Meta subscription api');