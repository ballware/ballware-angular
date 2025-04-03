import { HttpClient } from '@angular/common/http';
import { MetaMlModelApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}api/mlmodel/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}api/mlmodel/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

/**
 * Create adapter for mlmodel data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendMlModelApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string
): MetaMlModelApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
  } as MetaMlModelApi;
}
