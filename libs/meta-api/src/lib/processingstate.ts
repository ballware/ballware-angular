import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for processing state operations
 */
 export interface MetaProcessingstateApi {
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
   * Fetch select list containing all possible states for business object
   *
   * @param entity Identifier of business object type
   * @returns Observable containing list of available processing states
   */
  selectListForEntity: (
    entity: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch select list containing all allowed states for business object ids
   *
   * @param entity Identifier of business object type
   * @param ids Collection of ids to check
   * @returns Observable containing list of allowed processing states
   */
  selectListAllowedForEntityAndIds: (
    entity: string,
    ids: Array<string>
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single processing state by state number
   *
   * @param entity Identifier of business object type
   * @param state Unique state number
   * @returns Observable containing processing state data
   */
  selectByStateForEntity: (
    entity: string
  ) => (state: number | string) => Observable<Record<string, unknown>>;
}

export const META_PROCESSINGSTATE_API = new InjectionToken<MetaProcessingstateApi>('Meta processingstate api');