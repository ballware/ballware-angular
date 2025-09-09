import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for mlmodel operations
 */
 export interface MetaMlModelApi extends SelectableMetaApi {

  /**
   * Trigger training of models for given ids
   *
   * @param ids Collection of ids to trigger training for
   * @returns Observable resolving when update is triggered
   */
  train: (ids: Array<string>) => Observable<void>;
}

export const META_MLMODEL_API = new InjectionToken<MetaMlModelApi>('Meta mlmodel api');
