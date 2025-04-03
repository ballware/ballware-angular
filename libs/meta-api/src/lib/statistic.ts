import { Observable } from 'rxjs';

import { CompiledStatistic, QueryParams } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';

/**
 * Interface for statistic data operations
 */
 export interface MetaStatisticApi {
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
   * Fetch metadata for statistic
   * @param identifier Unique identifier of statistic item
   * @returns Observable containing statistic metadata
   */
  metadataForStatistic: (
    identifier: string
  ) => Observable<CompiledStatistic>;

  /**
   * Fetch content data for statistic
   * @param identifier Unique identifier of statistic item
   * @param param Optional parameters for query
   * @returns Observable containing statistic content
   */
  dataForStatistic: (
    identifier: string,
    params?: QueryParams
  ) => Observable<Array<Record<string, unknown>>>;
}

export const META_STATISTIC_API = new InjectionToken<MetaStatisticApi>('Meta statistic api');