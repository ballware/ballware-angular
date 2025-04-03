import { HttpClient } from '@angular/common/http';
import { MetaDocumentationApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/api/documentation/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/api/documentation/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

const loadDocumentationForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (  
  entity: string
): Observable<unknown> => {
  const url = `${metaServiceBaseUrl}/api/documentation/documentationforentity/${entity}`;

  return http
    .get(url, { responseType: 'text' });
};

/**
 * Create adapter for documentation data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendDocumentationApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string
): MetaDocumentationApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    loadDocumentationForEntity: loadDocumentationForEntity(httpClient, metaServiceBaseUrl),
  } as MetaDocumentationApi;
}
