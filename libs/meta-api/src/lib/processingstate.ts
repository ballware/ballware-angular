import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for processing state operations
 */
 export interface MetaProcessingstateApi {
  /**
   * Fetch select list containing all possible states for business object
   *
   * @param entity Identifier of business object type
   * @returns Observable containing list of available processing states
   */
  selectListForEntity: (
    entity: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch select list containing all allowed states for business object ids
   *
   * @param entity Identifier of business object type
   * @param ids Collection of ids to check
   * @returns Observable containing list of allowed processing states
   */
  selectListAllowedForEntityAndIds: (
    entity: string,
    ids: Array<string>
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single processing state by state number
   *
   * @param entity Identifier of business object type
   * @param state Unique state number
   * @returns Observable containing processing state data
   */
  selectByStateForEntity: (
    entity: string
  ) => (state: number | string) => Observable<Record<string, unknown>>;
}

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
