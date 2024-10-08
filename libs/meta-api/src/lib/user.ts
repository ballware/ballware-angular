import { HttpClient } from '@angular/common/http';
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

const selectListFunc = (http: HttpClient, serviceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/ballware-user-api/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string
): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/ballware-user-api/selectbyid/${identifier}`;

  return http
    .get<Record<string, unknown>>(url);
};

const switchTenantFunc = (http: HttpClient, serviceBaseUrl: string) => (  
  tenant: string
): Observable<void> => {
  const url = `${serviceBaseUrl}/ballware-user-api/tenant?tenant=${tenant}`;

  return http
    .post<void>(url, undefined);
};

/**
 * Create API adapter for ballware.identity.server user list access
 * @param serviceBaseUrl Base url for ballware.identity.server to use
 */
export function createIdentityBackendUserApi(
  httpClient: HttpClient,
  serviceBaseUrl: string
): IdentityUserApi {
  return {
    selectListFunc: selectListFunc(httpClient, serviceBaseUrl),
    selectByIdFunc: selectByIdFunc(httpClient, serviceBaseUrl),
    switchTenantFunc: switchTenantFunc(httpClient, serviceBaseUrl)
  } as IdentityUserApi;
}
