import { HttpClient } from '@angular/common/http';
import { MetaMlModelApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/mlmodel/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/mlmodel/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

const train = (http: HttpClient, mlServiceBaseUrl: string) => (ids: Array<string>): Observable<void> => {

  const url = `${mlServiceBaseUrl}/mlmodel/train?id=${ids.map(id => encodeURIComponent(id)).join('&id=')}`;

  return http
    .post<void>(url, null);
}

/**
 * Create adapter for mlmodel data operations with ballware.meta.service
 * @param httpClient HttpClient to use for requests
 * @param metaServiceBaseUrl Base URL to connect to ballware.meta.service
 * @param mlServiceBaseUrl Base URL to connect to ballware.ml.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendMlModelApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  mlServiceBaseUrl: string
): MetaMlModelApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    train: train(httpClient, mlServiceBaseUrl)
  } as MetaMlModelApi;
}
