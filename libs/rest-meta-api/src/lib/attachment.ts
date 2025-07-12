import { HttpClient } from '@angular/common/http';
import { MetaAttachmentApi } from '@ballware/meta-api';
import { Observable, of } from 'rxjs';

const fetchFunc = (http: HttpClient, serviceBaseUrl: string, entity: string, owner: string): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/attachment/allforentityandowner/${encodeURIComponent(entity)}/${encodeURIComponent(owner)}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const uploadFunc = (http: HttpClient, serviceBaseUrl: string, entity: string, owner: string, file: File): Observable<void> => {
  const url = `${serviceBaseUrl}/attachment/uploadforentityandowner/${encodeURIComponent(entity)}/${encodeURIComponent(owner)}`;

  const formData = new FormData();

  formData.append('files[]', file);

  return http.post<void>(url, formData);
};

const openFunc = (_http: HttpClient, serviceBaseUrl: string, tenant: string, entity: string, owner: string, id: string): Observable<string> => {
  const url = `${serviceBaseUrl}/attachment/downloadforentityandownerbyid/${encodeURIComponent(tenant)}/${encodeURIComponent(entity)}/${encodeURIComponent(owner)}/${encodeURIComponent(id)}`;

  return of(url);
};

const deleteFunc = (http: HttpClient, serviceBaseUrl: string, entity: string, owner: string, id: string): Observable<void> => {
  const url = `${serviceBaseUrl}/attachment/dropforentityandownerbyid/${encodeURIComponent(entity)}/${encodeURIComponent(owner)}/${encodeURIComponent(id)}`;

  return http.delete<void>(url);
};

/**
 * Create adapter for attachment data operations with ballware.storage.service
 * @param serviceBaseUrl Base URL to connect to ballware.storage.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendAttachmentApi(
  httpClient: HttpClient, 
  storageServiceBaseUrl: string,
  tenant: string,
  entity: string,
  owner: string
): MetaAttachmentApi {
  return {
    query: () => fetchFunc(httpClient, storageServiceBaseUrl, entity, owner),
    upload: (file) => uploadFunc(httpClient, storageServiceBaseUrl, entity, owner, file),
    open: (fileName) => openFunc(httpClient, storageServiceBaseUrl, tenant, entity, owner, fileName),
    remove: (fileName) => deleteFunc(httpClient, storageServiceBaseUrl, entity, owner, fileName)
  } as MetaAttachmentApi;
}
