import { HttpClient } from '@angular/common/http';
import { IdentityUserApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

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
export function createKeycloakUserApi(
  httpClient: HttpClient,
  serviceBaseUrl: string
): IdentityUserApi {
  return {
    selectList: selectListFunc(httpClient, serviceBaseUrl),
    selectById: selectByIdFunc(httpClient, serviceBaseUrl),
    switchTenant: switchTenantFunc(httpClient, serviceBaseUrl)
  } as IdentityUserApi;
}
