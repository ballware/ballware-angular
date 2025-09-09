import { Observable } from 'rxjs';

import { CompiledStatistic, QueryParams } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for statistic data operations
 */
 export interface MetaStatisticApi extends SelectableMetaApi {

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
