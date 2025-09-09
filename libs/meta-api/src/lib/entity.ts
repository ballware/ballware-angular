import { Observable } from 'rxjs';

import { CompiledEntityMetadata } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for entity metadata operations
 */
 export interface MetaEntityApi extends SelectableMetaApi {

  /**
   * Fetch single element for lookup by identifier
   *
   * @param identifier Identifier of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdentifier: (identifier: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list of available user right definitions
   *
   * @returns Observable containing result list of lookup query
   */
  rightSelectList: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element of available user right definitions
   *
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  rightSelectById: (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch metadata by entity identifier
   *
   * @param entity Identifier for business object type
   * @returns Observable containing metadata entity
   */
  metadataForEntity: (
    entity: string
  ) => Observable<CompiledEntityMetadata>;
}

export const META_ENTITY_API = new InjectionToken<MetaEntityApi>('Meta entity api');
