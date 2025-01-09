import { HttpClient } from '@angular/common/http';
import { MetaAttachmentApi } from '@ballware/meta-api';
import { Observable, of } from 'rxjs';

const fetchFunc = (http: HttpClient, serviceBaseUrl: string, owner: string): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/file/all/${owner}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const uploadFunc = (http: HttpClient, serviceBaseUrl: string, owner: string, file: File): Observable<void> => {
  const url = `${serviceBaseUrl}/api/file/upload/${owner}`;

  const formData = new FormData();

  formData.append('files[]', file);

  return http.post<void>(url, formData);
};

const openFunc = (_http: HttpClient, serviceBaseUrl: string, owner: string, fileName: string): Observable<string> => {
  const url = `${serviceBaseUrl}/api/file/byname/${owner}?file=${encodeURIComponent(
    fileName
  )}`;

  return of(url);
};

const deleteFunc = (http: HttpClient, serviceBaseUrl: string, owner: string, fileName: string): Observable<void> => {
  const url = `${serviceBaseUrl}/api/file/byname/${owner}?file=${encodeURIComponent(
    fileName
  )}`;

  return http.delete<void>(url);
};

/**
 * Create adapter for attachment data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendAttachmentApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  owner: string
): MetaAttachmentApi {
  return {
    query: () => fetchFunc(httpClient, metaServiceBaseUrl, owner),
    upload: (file) => uploadFunc(httpClient, metaServiceBaseUrl, owner, file),
    open: (fileName) => openFunc(httpClient, metaServiceBaseUrl, owner, fileName),
    remove: (fileName) => deleteFunc(httpClient, metaServiceBaseUrl, owner, fileName)
  } as MetaAttachmentApi;
}
