import { HttpClient } from '@angular/common/http';
import { MetaSubscriptionApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/subscription/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/subscription/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

const triggerSubscriptions = (http: HttpClient, documentServiceBaseUrl: string) => (ids: Array<string>): Observable<void> => {

  const url = `${documentServiceBaseUrl}/subscription/trigger?id=${ids.map(id => encodeURIComponent(id)).join('&id=')}`;

  return http
    .post<void>(url, null);
}

/**
 * Create adapter for subscription data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendSubscriptionApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string
): MetaSubscriptionApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    triggerSubscriptions: triggerSubscriptions(httpClient, documentServiceBaseUrl)
  } as MetaSubscriptionApi;
}
