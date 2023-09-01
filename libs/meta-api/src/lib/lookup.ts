import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for fetching lookups
 */
 export interface MetaLookupApi {
  /**
   * Fetch list by lookup
   *
   * @param lookup Identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookup: (
    lookup: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup and id
   *
   * @param lookup Id of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookup: (
    lookup: string
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup identifier
   *
   * @param identifier Unique identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupIdentifier: (
    identifier: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup identifier and id
   *
   * @param identifier Unique identifier of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupIdentifier: (
    identifier: string
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup with param
   *
   * @param lookup Identifier of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupWithParam: (
    lookup: string,
    param: unknown
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup with param and id
   *
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupWithParam: (
    lookup: string,
    param: unknown
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list of proposals for lookup
   *
   * @param lookup Id of lookup definition
   * @returns Observable containing proposals
   */
  autoCompleteForLookup: (
    lookup: string
  ) => Observable<Array<unknown>>;

  /**
   * Fetch list of proposals for lookup with param
   *
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing proposals
   */
  autoCompleteForLookupWithParam: (
    lookup: string,
    param: unknown
  ) => Observable<Array<unknown>>;
}

const selectListForLookupFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookup/${lookupId}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookup/${lookupId}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupIdentifierFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookupidentifier/${identifier}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupIdentifierFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookupidentifier/${identifier}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupWithParamFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string,
  param: unknown
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookupwithparam/${lookupId}/${param}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupWithParamFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string,
  param: unknown
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookupwithparam/${lookupId}/${param}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const autoCompleteForLookupFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string
): Observable<Array<unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/autocompleteforlookup/${lookupId}`;

  return http
    .get<Array<unknown>>(url);
};

const autoCompleteForLookupWithParamFunc = (http: HttpClient, serviceBaseUrl: string) => (
  lookupId: string,
  param: unknown
): Observable<Array<unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/autocompleteforlookupwithparam/${lookupId}/${param}`;

  return http
    .get<Array<unknown>>(url);
};

/**
 * Create adapter for lookup fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendLookupApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaLookupApi {
  return {
    selectListForLookup: selectListForLookupFunc(httpClient, serviceBaseUrl),
    selectByIdForLookup: selectByIdForLookupFunc(httpClient, serviceBaseUrl),
    selectListForLookupIdentifier: selectListForLookupIdentifierFunc(
      httpClient, 
      serviceBaseUrl
    ),
    selectByIdForLookupIdentifier: selectByIdForLookupIdentifierFunc(
      httpClient, 
      serviceBaseUrl
    ),
    selectListForLookupWithParam: selectListForLookupWithParamFunc(
      httpClient, 
      serviceBaseUrl
    ),
    selectByIdForLookupWithParam: selectByIdForLookupWithParamFunc(
      httpClient, 
      serviceBaseUrl
    ),
    autoCompleteForLookup: autoCompleteForLookupFunc(httpClient, serviceBaseUrl),
    autoCompleteForLookupWithParam: autoCompleteForLookupWithParamFunc(
      httpClient, 
      serviceBaseUrl
    ),
  } as MetaLookupApi;
}
