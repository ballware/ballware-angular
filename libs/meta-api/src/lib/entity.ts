import { Observable } from 'rxjs';

import { CompiledEntityMetadata, DocumentSelectEntry} from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';

/**
 * Interface for entity metadata operations
 */
 export interface MetaEntityApi {
  /**
   * Fetch metadata by entity identifier
   *
   * @param entity Identifier for business object type
   * @returns Observable containing metadata entity
   */
  metadataForEntity: (
    entity: string
  ) => Observable<CompiledEntityMetadata>;

  /**
   * Fetch available print documents for business object type
   *
   * @param entity Identifier for business object type
   * @returns Observable containing available print documents for entity
   */
  documentsForEntity: (
    entity: string
  ) => Observable<Array<DocumentSelectEntry>>;
}

export const META_ENTITY_API = new InjectionToken<MetaEntityApi>('Meta entity api');