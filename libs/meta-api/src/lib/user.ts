import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Functions for accessing user information from identity provider
 */
 export interface IdentityUserApi {
  /**
   * Returning a list of available users in identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resolving list of available user with id and display text
   */
  selectListFunc: () => Observable<Array<Record<string, unknown>>>;
  /**
   * Returns a single existing user by identifier from identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resoling single element with id and display text for requested identifier
   */
  selectByIdFunc: (identifier: string) => Observable<Record<string, unknown>>;

  /**
   * Switch current user to tenant
   * 
   * @param tenant - identifier of destination tenant
   * @returns Promise resolved when tenant switch is completed
   */
  switchTenantFunc: (tenant: string) => Observable<void>;
}

export const IDENTITY_USER_API = new InjectionToken<IdentityUserApi>('Identity user api');