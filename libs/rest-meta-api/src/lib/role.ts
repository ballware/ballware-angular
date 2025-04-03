import { HttpClient } from '@angular/common/http';
import { IdentityRoleApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

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
export function createKeycloakRoleApi(
  httpClient: HttpClient,
  serviceBaseUrl: string
): IdentityRoleApi {
  return {
    selectList: selectListFunc(httpClient, serviceBaseUrl),
    selectById: selectByIdFunc(httpClient, serviceBaseUrl),
  } as IdentityRoleApi;
}
