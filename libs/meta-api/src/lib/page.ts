import { Observable } from 'rxjs';

import { CompiledPageData } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';

/**
 * Interface for page metadata operations
 */
 export interface MetaPageApi {
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
   * Fetch page metadata by identifier
   *
   * @param page Identifier for page
   * @returns Observable containing page metadata
   */
  pageDataForIdentifier: (
    page: string
  ) => Observable<CompiledPageData>;
}

export const META_PAGE_API = new InjectionToken<MetaPageApi>('Meta page api');