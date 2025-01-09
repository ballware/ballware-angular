import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CrudItem, QueryParams } from '@ballware/meta-model';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiError, GenericEntityApi } from '@ballware/meta-api';
import { additionalParamsToUrl } from './util';

const queryFunc = (http: HttpClient, baseUrl: string) => (
  query: string,
  params?: QueryParams
): Observable<Array<CrudItem>> => {
  const queryParams = params ? additionalParamsToUrl(params) : undefined;

  const url = queryParams
    ? `${baseUrl}/query?identifier=${encodeURIComponent(query)}${queryParams}`
    : `${baseUrl}/all?identifier=${encodeURIComponent(query)}`;

  return http
    .get<Array<CrudItem>>(url)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }));
};

const countFunc = (http: HttpClient, baseUrl: string) => (
  query: string,
  params?: QueryParams
): Observable<number> => {
  const queryParams = params ? additionalParamsToUrl(params) : undefined;

  const url = queryParams
    ? `${baseUrl}/count?identifier=${encodeURIComponent(query)}${queryParams}`
    : `${baseUrl}/count?identifier=${encodeURIComponent(query)}`;

  return http
    .get<{ count: number }>(url)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }))
    .pipe(map(value => value?.count));
};

const byIdFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  id: string
): Observable<CrudItem> => {
  const url = `${baseUrl}/byId?identifier=${encodeURIComponent(functionIdentifier)}&id=${encodeURIComponent(id)}`;

  return http
    .get<CrudItem>(url)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }));
};

const newFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  params?: QueryParams
): Observable<CrudItem> => {
  const queryParams = params ? additionalParamsToUrl(params) : undefined;

  const url = queryParams
    ? `${baseUrl}/newquery?identifier=${encodeURIComponent(functionIdentifier)}${queryParams}`
    : `${baseUrl}/new?identifier=${encodeURIComponent(functionIdentifier)}`;

  return http
    .get<CrudItem>(url)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }));
};

const saveFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  item: object
): Observable<void> => {
  const url = `${baseUrl}/save?identifier=${encodeURIComponent(functionIdentifier)}`;

  return http.post<void>(url, JSON.stringify(item), {
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .pipe(catchError((error: HttpErrorResponse) => {      
    return throwError(() => ({
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      payload: error.error
    } as ApiError))
  }));
};

const saveBatchFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  items: object[]
): Observable<void> => {
  const url = `${baseUrl}/savebatch?identifier=${encodeURIComponent(functionIdentifier)}`;

  
  return http
    .post<void>(url, JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }));
};

const removeFunc = (http: HttpClient, baseUrl: string) => (
  id: string
): Observable<void> => {
  const url = `${baseUrl}/remove/${id}`;

  return http
    .delete<void>(url)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError));              
  }));
};

const importFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  file: File
): Observable<void> => {
  const url = `${baseUrl}/import?identifier=${encodeURIComponent(functionIdentifier)}`;

  const formData = new FormData();

  formData.append('files[]', file);

  return http.post<void>(url, formData)
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }));
};

const exportFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  ids: string[]
): Observable<string> => {
  const url = `${baseUrl}/exporturl?identifier=${encodeURIComponent(functionIdentifier)}`;
  
  return http
    .post(url, `${ids.map(u => `id=${encodeURIComponent(u)}`).join('&')}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'text'
    })
    .pipe(catchError((error: HttpErrorResponse) => {      
      return throwError(() => ({
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        payload: error.error
      } as ApiError))
    }))
    .pipe(map(data => `${baseUrl}/download?id=${encodeURIComponent(data)}`));
};


/**
 * Create adapter for generic entity data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createGenericBackendEntityApi(
  httpClient: HttpClient, 
  entityBaseUrl: string
): GenericEntityApi {
  return {
    query: queryFunc(httpClient, entityBaseUrl),
    count: countFunc(httpClient, entityBaseUrl),
    byId: byIdFunc(httpClient, entityBaseUrl),
    new: newFunc(httpClient, entityBaseUrl),
    save: saveFunc(httpClient, entityBaseUrl),
    saveBatch: saveBatchFunc(httpClient, entityBaseUrl),
    drop: removeFunc(httpClient, entityBaseUrl),
    exportItems: exportFunc(httpClient, entityBaseUrl),
    importItems: importFunc(httpClient, entityBaseUrl)
  } as GenericEntityApi;
}
