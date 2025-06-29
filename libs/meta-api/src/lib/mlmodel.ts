import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for mlmodel operations
 */
 export interface MetaMlModelApi {
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
   * Trigger training of models for given ids
   * 
   * @param ids Collection of ids to trigger training for
   * @returns Observable resolving when update is triggered
   */
  train: (ids: Array<string>) => Observable<void>;
}

export const META_MLMODEL_API = new InjectionToken<MetaMlModelApi>('Meta mlmodel api');