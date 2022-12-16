import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for fetching lookups
 */
 export interface MetaLookupApi {
  /**
   * Fetch list by lookup
   *
   * @param token Access token required for authentication
   * @param lookup Identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookup: (
    http: HttpClient,
    lookup: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup and id
   *
   * @param token Access token required for authentication
   * @param lookup Id of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookup: (
    http: HttpClient,
    lookup: string
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup identifier
   *
   * @param token Access token required for authentication
   * @param identifier Unique identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupIdentifier: (
    http: HttpClient,
    identifier: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup identifier and id
   *
   * @param token Access token required for authentication
   * @param identifier Unique identifier of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupIdentifier: (
    http: HttpClient,
    identifier: string
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup with param
   *
   * @param token Access token required for authentication
   * @param lookup Identifier of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupWithParam: (
    http: HttpClient,
    lookup: string,
    param: unknown
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup with param and id
   *
   * @param token Access token required for authentication
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupWithParam: (
    http: HttpClient,
    lookup: string,
    param: unknown
  ) => (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch list of proposals for lookup
   *
   * @param token Access token required for authentication
   * @param lookup Id of lookup definition
   * @returns Observable containing proposals
   */
  autoCompleteForLookup: (
    http: HttpClient,
    lookup: string
  ) => Observable<Array<unknown>>;

  /**
   * Fetch list of proposals for lookup with param
   *
   * @param token Access token required for authentication
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing proposals
   */
  autoCompleteForLookupWithParam: (
    http: HttpClient,
    lookup: string,
    param: unknown
  ) => Observable<Array<unknown>>;
}

const selectListForLookupFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  lookupId: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookup/${lookupId}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  lookupId: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookup/${lookupId}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupIdentifierFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  identifier: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookupidentifier/${identifier}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupIdentifierFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  identifier: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookupidentifier/${identifier}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupWithParamFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  lookupId: string,
  param: unknown
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectlistforlookupwithparam/${lookupId}/${param}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupWithParamFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  lookupId: string,
  param: unknown
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/selectbyidforlookupwithparam/${lookupId}/${param}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const autoCompleteForLookupFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
  lookupId: string
): Observable<Array<unknown>> => {
  const url = `${serviceBaseUrl}/api/lookup/autocompleteforlookup/${lookupId}`;

  return http
    .get<Array<unknown>>(url);
};

const autoCompleteForLookupWithParamFunc = (serviceBaseUrl: string) => (
  http: HttpClient,
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
  serviceBaseUrl: string
): MetaLookupApi {
  return {
    selectListForLookup: selectListForLookupFunc(serviceBaseUrl),
    selectByIdForLookup: selectByIdForLookupFunc(serviceBaseUrl),
    selectListForLookupIdentifier: selectListForLookupIdentifierFunc(
      serviceBaseUrl
    ),
    selectByIdForLookupIdentifier: selectByIdForLookupIdentifierFunc(
      serviceBaseUrl
    ),
    selectListForLookupWithParam: selectListForLookupWithParamFunc(
      serviceBaseUrl
    ),
    selectByIdForLookupWithParam: selectByIdForLookupWithParamFunc(
      serviceBaseUrl
    ),
    autoCompleteForLookup: autoCompleteForLookupFunc(serviceBaseUrl),
    autoCompleteForLookupWithParam: autoCompleteForLookupWithParamFunc(
      serviceBaseUrl
    ),
  } as MetaLookupApi;
}
