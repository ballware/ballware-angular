import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for pickvalue operations
 */
 export interface MetaPickvalueApi {
  /**
   * Fetch select list for business object property possible values
   *
   * @param entity Business object identifier
   * @param field Business object property
   * @returns Observable containing collection of possible property values
   */
  selectListForEntityAndField: (
    entity: string,
    field: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single select list element for business object property
   *
   * @param entity Business object identifier
   * @param field Business object property
   * @param value Value requesting select list element
   * @returns Observable containing single property value
   */
  selectByValueForEntityAndField: (
    entity: string,
    field: string
  ) => (value: number | string) => Observable<Record<string, unknown>>;
}

export const META_PICKVALUE_API = new InjectionToken<MetaPickvalueApi>('Meta pickvalue api');