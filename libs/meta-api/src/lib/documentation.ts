import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for documentation viewer operations
 */
 export interface MetaDocumentationApi extends SelectableMetaApi {

  /**
   * Fetch documentation for business object type
   *
   * @param entity Requested business object type
   * @returns Observable containing rich text for rendering documentation
   */
  loadDocumentationForEntity: (
    entity: string
  ) => Observable<unknown>;
}

export const META_DOCUMENTATION_API = new InjectionToken<MetaDocumentationApi>('Meta documentation api');
