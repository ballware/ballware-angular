import { HttpClient } from '@angular/common/http';
import { MetaLookupApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

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
