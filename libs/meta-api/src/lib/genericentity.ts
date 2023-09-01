import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CrudItem, QueryParams } from '@ballware/meta-model';
import { additionalParamsToUrl } from './util';

/**
 * Interface for generic business object crud operations
 */
 export interface MetaGenericEntityApi {
  /**
   * Query list of business objects by search params
   *
   * @param query Identifier of list query
   * @param params Parameter values for query
   * @returns Observable containing list of resulting business objects
   */
  query: (
    query: string,
    params?: QueryParams
  ) => Observable<Array<CrudItem>>;

  /**
   * Query count of business objects by search params
   *
   * @param query Identifier of list query
   * @param params Parameter values for query
   * @returns Observable containing count of resulting business objects
   */
  count: (
    query: string,
    params?: QueryParams
  ) => Observable<number>;

  /**
   * Fetch single business object by id
   *
   * @param functionIdentifier Identifier of edit function
   * @param id Id of business object
   * @returns Observable containing instance of business object
   */
  byId: (functionIdentifier: string, id: string) => Observable<CrudItem>;

  /**
   * Fetch prepared new instance of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param params Parameter values for initialization of business object
   * @returns Observable containing new generated instance of business object
   */
  new: (functionIdentifier: string, params?: QueryParams) => Observable<CrudItem>;

  /**
   * Save modified instance of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param item Modified instance of business object
   * @returns Observable resolved when save operation has finished
   */
  save: (functionIdentifier: string, item: CrudItem) => Observable<void>;

  /**
   * Save multiple modified instances of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param items Modified instances of business object
   * @returns Observable resolved when save operation has finished
   */
  saveBatch: (functionIdentifier: string, items: CrudItem[]) => Observable<void>;

  /**
   * Drop existing instance of business object
   *
   * @param id Identifier of business object instance to drop
   * @returns Observable resolved when drop operation has finished
   */
  drop: (id: string) => Observable<void>;

  /**
   * Import business objects from uploaded file
   *
   * @param functionIdentifier Identifier of import function
   * @param file Uploaded file containing objects to import
   * @returns Observable resolved when drop operation has finished
   */
  importItems: (functionIdentifier: string, file: File) => Observable<void>;

  /**
   * Export business objects to download file
   *
   * @param functionIdentifier Identifier of import function
   * @param ids Selected object ids to export
   * @returns Observable resolved when download is ready, containing download url
   */
  exportItems: (functionIdentifier: string, ids: string[]) => Observable<string>;
}

const queryFunc = (http: HttpClient, baseUrl: string) => (
  query: string,
  params?: QueryParams
): Observable<Array<CrudItem>> => {
  const queryParams = params ? additionalParamsToUrl(params) : undefined;

  const url = queryParams
    ? `${baseUrl}/query?identifier=${encodeURIComponent(query)}${queryParams}`
    : `${baseUrl}/all?identifier=${encodeURIComponent(query)}`;

  return http
    .get<Array<CrudItem>>(url);
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
    .pipe(map(value => value?.count));
};

const byIdFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  id: string
): Observable<CrudItem> => {
  const url = `${baseUrl}/byId?identifier=${encodeURIComponent(functionIdentifier)}&id=${encodeURIComponent(id)}`;

  return http
    .get<CrudItem>(url);
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
    .get<CrudItem>(url);
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
  });
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
    });
};

const removeFunc = (http: HttpClient, baseUrl: string) => (
  id: string
): Observable<void> => {
  const url = `${baseUrl}/remove/${id}`;

  return http
    .delete<void>(url);
};

const importFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  file: File
): Observable<void> => {
  const url = `${baseUrl}/import?identifier=${encodeURIComponent(functionIdentifier)}`;

  const formData = new FormData();

  formData.append('files[]', file);

  return http.post<void>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  });
};

const exportFunc = (http: HttpClient, baseUrl: string) => (
  functionIdentifier: string,
  ids: string[]
): Observable<string> => {
  const url = `${baseUrl}/exporturl?identifier=${encodeURIComponent(functionIdentifier)}`;

  return http
    .post<string>(url, `${ids.map(u => `id=${encodeURIComponent(u)}`).join('&')}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .pipe(map(data => `${baseUrl}/download?id=${encodeURIComponent(data)}`));
};


/**
 * Create adapter for generic entity data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendGenericEntityApi(
  httpClient: HttpClient, 
  entityBaseUrl: string
): MetaGenericEntityApi {
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
  } as MetaGenericEntityApi;
}
