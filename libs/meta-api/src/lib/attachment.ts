import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';

/**
 * Interface for owner specific attachments operations
 */
 export interface MetaAttachmentApi {
  /**
   * Query list of attachments by owner
   *
   * @param owner - Identifier for owner
   * @returns Observable with list of attachment metadata belonging to owner
   */
  queryByOwner: (    
    owner: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Upload new attachment
   *
   * @param owner - Identifier for owner
   * @param file - Uploaded file
   * @returns Observable resolved when upload finished
   */
  upload: (owner: string, file: File) => Observable<void>;

  /**
   * Fetch file url for display/download
   *
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable with URL for download of file
   */
  open: (owner: string, fileName: string) => Observable<string>;

  /**
   * Remove existing attachment
   *
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable resolved when remove operation finished
   */
  remove: (owner: string, fileName: string) => Observable<void>;
}

const attachmentFetchFunc = (http: HttpClient, serviceBaseUrl: string) => (  
  owner: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}api/file/all/${owner}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const attachmentUploadFunc = (http: HttpClient, serviceBaseUrl: string) => (
  owner: string,
  file: File
): Observable<void> => {
  const url = `${serviceBaseUrl}api/file/upload/${owner}`;

  const formData = new FormData();

  formData.append('files[]', file);

  return http.post<void>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  });
};

const attachmentOpenFunc = (_http: HttpClient, serviceBaseUrl: string) => (
  owner: string,
  fileName: string
): Observable<string> => {
  const url = `${serviceBaseUrl}api/file/byname/${owner}?file=${encodeURIComponent(
    fileName
  )}`;

  return from(url);
};

const attachmentDeleteFunc = (http: HttpClient, serviceBaseUrl: string) => (  
  owner: string,
  fileName: string
): Observable<void> => {
  const url = `${serviceBaseUrl}api/file/byname/${owner}?file=${encodeURIComponent(
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
  serviceBaseUrl: string
): MetaAttachmentApi {
  return {
    queryByOwner: attachmentFetchFunc(httpClient, serviceBaseUrl),
    upload: attachmentUploadFunc(httpClient, serviceBaseUrl),
    open: attachmentOpenFunc(httpClient, serviceBaseUrl),
    remove: attachmentDeleteFunc(httpClient, serviceBaseUrl),
  } as MetaAttachmentApi;
}
