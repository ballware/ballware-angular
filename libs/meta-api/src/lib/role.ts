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
  selectListFunc: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Returns a single existing role by identifier from identity system
   *
   * @param token - access token required for authentication
   * @returns Promise resoling single element with id and display text for requested identifier
   */
  selectByIdFunc: (
    identifier: string
  ) => Observable<Record<string, unknown>>;
}

const selectListFunc = (http: HttpClient, serviceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/ballware-role-api/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string
): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/ballware-role-api/selectbyid/${identifier}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create API adapter for ballware.identity.server role list access
 * @param serviceBaseUrl Base url for ballware.identity.server to use
 */
export function createIdentityBackendRoleApi(
  httpClient: HttpClient,
  serviceBaseUrl: string
): IdentityRoleApi {
  return {
    selectListFunc: selectListFunc(httpClient, serviceBaseUrl),
    selectByIdFunc: selectByIdFunc(httpClient, serviceBaseUrl),
  } as IdentityRoleApi;
}
