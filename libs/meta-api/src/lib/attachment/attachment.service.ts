import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { MetaAttachmentApiService } from '../attachment';

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
export class DefaultMetaAttachmentApiService extends MetaAttachmentApiService {
    constructor(protected httpClient: HttpClient, protected serviceBaseUrl: string) {
        super();
    }

    override queryByOwner(owner: string) {
        return attachmentFetchFunc(this.httpClient, this.serviceBaseUrl)(owner);
    };

    override upload(owner: string, file: File) {
        return attachmentUploadFunc(this.httpClient, this.serviceBaseUrl)(owner, file);
    }

    override open(owner: string, fileName: string): Observable<string> {
        return attachmentOpenFunc(this.httpClient, this.serviceBaseUrl)(owner, fileName);
    }

    override remove(owner: string, fileName: string): Observable<void> {
        return attachmentDeleteFunc(this.httpClient, this.serviceBaseUrl)(owner, fileName);
    }
}