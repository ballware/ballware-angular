import { HttpClient } from '@angular/common/http';
import { MetaPickvalueApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

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
