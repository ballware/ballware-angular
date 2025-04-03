import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Functions for accessing role information from identity provider
 */
 export interface IdentityRoleApi {
  /**
   * Returning a list of available roles in identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resolving list of available roles with id and display text
   */
  selectList: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Returns a single existing role by identifier from identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resoling single element with id and display text for requested identifier
   */
  selectById: (
    identifier: string
  ) => Observable<Record<string, unknown>>;
}

export const IDENTITY_ROLE_API = new InjectionToken<IdentityRoleApi>('Identity role api');