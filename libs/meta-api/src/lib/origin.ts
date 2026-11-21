import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface AiOriginApi {
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

  addFromAttachment: (entity: string, owner: string, id: string, name: string) => Observable<void>;
  createEmbedding: (ids: Array<string>, model: string, activate: boolean) => Observable<void>;
}

export const AI_ORIGIN_API = new InjectionToken<AiOriginApi>('AI origin api');
