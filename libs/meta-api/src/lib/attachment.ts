import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';

/**
 * Interface for owner specific attachments operations
 */
 export interface MetaAttachmentApi {
  /**
   * Query list of attachments by owner
   *
   * @param token - Access token required for authentication
   * @param owner - Identifier for owner
   * @returns Observable with list of attachment metadata belonging to owner
   */
  queryByOwner: (
    http: HttpClient,
    owner: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Upload new attachment
   *
   * @param token - Access token required for authentication
   * @param owner - Identifier for owner
   * @param file - Uploaded file
   * @returns Observable resolved when upload finished
   */
  upload: (http: HttpClient, owner: string, file: File) => Observable<void>;

  /**
   * Fetch file url for display/download
   *
   * @param token - Access token required for authentication
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable with URL for download of file
   */
  open: (http: HttpClient, owner: string, fileName: string) => Observable<string>;

  /**
   * Remove existing attachment
   *
   * @param token - Access token required for authentication
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable resolved when remove operation finished
   */
  remove: (http: HttpClient, owner: string, fileName: string) => Observable<void>;
}

const attachmentFetchFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  owner: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}api/file/all/${owner}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const attachmentUploadFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
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

const attachmentOpenFunc = (serviceBaseUrl: string) => (
  _http: HttpClient,
  owner: string,
  fileName: string
): Observable<string> => {
  const url = `${serviceBaseUrl}api/file/byname/${owner}?file=${encodeURIComponent(
    fileName
  )}`;

  return from(url);
};

const attachmentDeleteFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
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
  serviceBaseUrl: string
): MetaAttachmentApi {
  return {
    queryByOwner: attachmentFetchFunc(serviceBaseUrl),
    upload: attachmentUploadFunc(serviceBaseUrl),
    open: attachmentOpenFunc(serviceBaseUrl),
    remove: attachmentDeleteFunc(serviceBaseUrl),
  } as MetaAttachmentApi;
}
