import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for processing state operations
 */
 export interface MetaProcessingstateApi {
  /**
   * Fetch select list containing all possible states for business object
   *
   * @param token Access token required for authentication
   * @param entity Identifier of business object type
   * @returns Observable containing list of available processing states
   */
  selectListForEntity: (
    http: HttpClient,
    entity: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch select list containing all allowed states for business object ids
   *
   * @param token Access token required for authentication
   * @param entity Identifier of business object type
   * @param ids Collection of ids to check
   * @returns Observable containing list of allowed processing states
   */
  selectListAllowedForEntityAndIds: (
    http: HttpClient,
    entity: string,
    ids: Array<string>
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single processing state by state number
   *
   * @param token Access token required for authentication
   * @param entity Identifier of business object type
   * @param state Unique state number
   * @returns Observable containing processing state data
   */
  selectByStateForEntity: (
    http: HttpClient,
    entity: string
  ) => (state: number | string) => Observable<Record<string, unknown>>;
}

const selectListForEntity = (serviceBaseUrl: string) => (
  http: HttpClient,
  entity: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/processingstate/selectlistforentity/${entity}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectListAllowedForEntityAndIds = (serviceBaseUrl: string) => (
  http: HttpClient,
  entity: string,
  ids: Array<string>
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/processingstate/selectlistallowedsuccessorsforentities/${entity}?${ids
    .map(i => `id=${i}`)
    .join('&')}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByStateForEntity = (serviceBaseUrl: string) => (
  http: HttpClient,
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
  serviceBaseUrl: string
): MetaProcessingstateApi {
  return {
    selectListForEntity: selectListForEntity(serviceBaseUrl),
    selectListAllowedForEntityAndIds: selectListAllowedForEntityAndIds(
      serviceBaseUrl
    ),
    selectByStateForEntity: selectByStateForEntity(serviceBaseUrl),
  } as MetaProcessingstateApi;
}
