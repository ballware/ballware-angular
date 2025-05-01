import { HttpClient } from '@angular/common/http';
import { MetaLookupApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectListForLookupFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectlistforlookup/${lookupId}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectbyidforlookup/${lookupId}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupIdentifierFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  identifier: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectlistforlookupidentifier/${identifier}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupIdentifierFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  identifier: string
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectbyidforlookupidentifier/${identifier}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const selectListForLookupWithParamFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string,
  param: unknown
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectlistforlookupwithparam/${lookupId}/${param}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByIdForLookupWithParamFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string,
  param: unknown
) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${tenantServiceBaseUrl}/lookup/selectbyidforlookupwithparam/${lookupId}/${param}/${id}`;

  return http
    .get<Record<string, unknown>>(url);
};

const autoCompleteForLookupFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string
): Observable<Array<unknown>> => {
  const url = `${tenantServiceBaseUrl}/lookup/autocompleteforlookup/${lookupId}`;

  return http
    .get<Array<unknown>>(url);
};

const autoCompleteForLookupWithParamFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  lookupId: string,
  param: unknown
): Observable<Array<unknown>> => {
  const url = `${tenantServiceBaseUrl}/lookup/autocompleteforlookupwithparam/${lookupId}/${param}`;

  return http
    .get<Array<unknown>>(url);
};

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/lookup/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/lookup/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

/**
 * Create adapter for lookup fetch operations with ballware.meta.service
 * @param metaServiceBaseUrl Base URL to connect to ballware.meta.service
 * @param tenantServiceBaseUrl Base URL to connect to ballware.tenant.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendLookupApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  tenantServiceBaseUrl: string
): MetaLookupApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    selectListForLookup: selectListForLookupFunc(httpClient, tenantServiceBaseUrl),
    selectByIdForLookup: selectByIdForLookupFunc(httpClient, tenantServiceBaseUrl),
    selectListForLookupIdentifier: selectListForLookupIdentifierFunc(
      httpClient, 
      tenantServiceBaseUrl
    ),
    selectByIdForLookupIdentifier: selectByIdForLookupIdentifierFunc(
      httpClient, 
      tenantServiceBaseUrl
    ),
    selectListForLookupWithParam: selectListForLookupWithParamFunc(
      httpClient, 
      tenantServiceBaseUrl
    ),
    selectByIdForLookupWithParam: selectByIdForLookupWithParamFunc(
      httpClient, 
      tenantServiceBaseUrl
    ),
    autoCompleteForLookup: autoCompleteForLookupFunc(httpClient, tenantServiceBaseUrl),
    autoCompleteForLookupWithParam: autoCompleteForLookupWithParamFunc(
      httpClient, 
      tenantServiceBaseUrl
    ),
  } as MetaLookupApi;
}
