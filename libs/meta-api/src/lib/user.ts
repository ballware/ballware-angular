import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectableMetaApi } from './selectable';

/**
 * Functions for accessing user information from identity provider
 */
 export interface IdentityUserApi extends SelectableMetaApi {

  /**
   * Switch current user to tenant
   *
   * @param tenant - identifier of destination tenant
   * @returns Promise resolved when tenant switch is completed
   */
  switchTenant: (tenant: string) => Observable<void>;
}

export const IDENTITY_USER_API = new InjectionToken<IdentityUserApi>('Identity user api');
