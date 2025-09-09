import { Observable } from 'rxjs';

import { CompiledPageData } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for page metadata operations
 */
 export interface MetaPageApi extends SelectableMetaApi {

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
