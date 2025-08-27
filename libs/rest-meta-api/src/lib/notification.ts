import { HttpClient } from '@angular/common/http';
import { MetaNotificationApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/notification/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/notification/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

/**
 * Create adapter for notification data operations with ballware.document.service
 * @param documentServiceBaseUrl Base URL to connect to ballware.document.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendNotificationApi(
  httpClient: HttpClient, 
  documentServiceBaseUrl: string
): MetaNotificationApi {
  return {
    selectList: selectList(httpClient, documentServiceBaseUrl),
    selectById: selectById(httpClient, documentServiceBaseUrl),
  } as MetaNotificationApi;
}
