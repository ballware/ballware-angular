import { HttpClient } from '@angular/common/http';
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
  selectListFunc: (http: HttpClient) => Observable<Array<Record<string, unknown>>>;

  /**
   * Returns a single existing role by identifier from identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resoling single element with id and display text for requested identifier
   */
  selectByIdFunc: (
    http: HttpClient,
    identifier: string
  ) => Observable<Record<string, unknown>>;
}

const selectListFunc = (serviceBaseUrl: string) => (
  http: HttpClient
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/role/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  identifier: string
): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/role/selectbyid/${identifier}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create API adapter for ballware.identity.server role list access
 * @param serviceBaseUrl Base url for ballware.identity.server to use
 */
export function createIdentityBackendRoleApi(
  serviceBaseUrl: string
): IdentityRoleApi {
  return {
    selectListFunc: selectListFunc(serviceBaseUrl),
    selectByIdFunc: selectByIdFunc(serviceBaseUrl),
  } as IdentityRoleApi;
}
