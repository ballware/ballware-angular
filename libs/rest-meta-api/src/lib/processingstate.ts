import { HttpClient } from '@angular/common/http';
import { MetaProcessingstateApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectListForEntity = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/processingstate/selectlistforentity/${entity}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectListAllowedForEntityAndIds = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string,
  ids: Array<string>
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/processingstate/selectlistallowedsuccessorsforentities/${entity}?${ids
    .map(i => `id=${i}`)
    .join('&')}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByStateForEntity = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string
) => (state: number | string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/processingstate/selectbystateforentity/${entity}/${state}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create adapter for processing state fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendProcessingstateApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaProcessingstateApi {
  return {
    selectListForEntity: selectListForEntity(httpClient, serviceBaseUrl),
    selectListAllowedForEntityAndIds: selectListAllowedForEntityAndIds(
      httpClient,
      serviceBaseUrl
    ),
    selectByStateForEntity: selectByStateForEntity(httpClient, serviceBaseUrl),
  } as MetaProcessingstateApi;
}
