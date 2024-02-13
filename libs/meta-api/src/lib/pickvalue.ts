import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for pickvalue operations
 */
 export interface MetaPickvalueApi {
  /**
   * Fetch select list for business object property possible values
   *
   * @param entity Business object identifier
   * @param field Business object property
   * @returns Observable containing collection of possible property values
   */
  selectListForEntityAndField: (
    entity: string,
    field: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single select list element for business object property
   *
   * @param entity Business object identifier
   * @param field Business object property
   * @param value Value requesting select list element
   * @returns Observable containing single property value
   */
  selectByValueForEntityAndField: (
    entity: string,
    field: string
  ) => (value: number | string) => Observable<Record<string, unknown>>;
}

const selectListForEntityAndField = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string,
  field: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/pickvalue/selectlistforentityandfield/${entity}/${field}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByValueForEntityAndField = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string,
  field: string
) => (value: number | string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/pickvalue/selectbyvalueforentityandfield/${entity}/${field}/${value}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create adapter for pickvalue fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendPickvalueApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaPickvalueApi {
  return {
    selectListForEntityAndField: selectListForEntityAndField(httpClient, serviceBaseUrl),
    selectByValueForEntityAndField: selectByValueForEntityAndField(
      httpClient, serviceBaseUrl
    ),
  } as MetaPickvalueApi;
}
