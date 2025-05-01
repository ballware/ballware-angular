import { HttpClient } from '@angular/common/http';
import { MetaProcessingstateApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectListForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectlistforentity/${entity}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectListAllowedForEntityAndIds = (http: HttpClient, tenantServiceBaseUrl: string) => (
  entity: string,
  ids: Array<string>
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/processingstate/selectlistallowedsuccessorsforentities/${entity}?${ids
    .map(i => `id=${i}`)
    .join('&')}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByStateForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
) => (state: number | string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectbystateforentity/${entity}/${state}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create adapter for processing state fetch operations with ballware.meta.service
 * @param metaServiceBaseUrl Base URL to connect to ballware.meta.service
 * @param tenantServiceBaseUrl Base URL to connect to ballware.tenant.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendProcessingstateApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  tenantServiceBaseUrl: string
): MetaProcessingstateApi {
  return {
    selectListForEntity: selectListForEntity(httpClient, metaServiceBaseUrl),
    selectListAllowedForEntityAndIds: selectListAllowedForEntityAndIds(
      httpClient,
      tenantServiceBaseUrl
    ),
    selectByStateForEntity: selectByStateForEntity(httpClient, metaServiceBaseUrl),
  } as MetaProcessingstateApi;
}
