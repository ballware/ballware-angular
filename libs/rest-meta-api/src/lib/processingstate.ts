import { HttpClient } from '@angular/common/http';
import { MetaProcessingstateApi } from '@ballware/meta-api';
import { Observable } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

const selectListForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectlistforentity/${entity}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectListMetaAllowedForEntityAndIds = (http: HttpClient, metaServiceBaseUrl: string, documentServiceBaseUrl: string) => (
  entity: string,
  ids: Array<string>
): Observable<Array<Record<string, unknown>>> => {

  let serviceBaseUrl = metaServiceBaseUrl;

  switch (entity) {
    case 'document':
    case 'notification':
    case 'subscription':
      serviceBaseUrl = documentServiceBaseUrl;
      break;
  }

  const url = `${serviceBaseUrl}/processingstate/selectlistallowedsuccessorsforentities/${entity}?${ids
    .map(i => `id=${i}`)
    .join('&')}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectListTenantAllowedForEntityAndIds = (http: HttpClient, tenantServiceBaseUrl: string) => (
  entity: string,
  ids: Array<string>
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/processingstate/selectlistallowedsuccessorsforentities/${entity}?${ids
    .map(i => `id=${i}`)
    .join('&')}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectByStateForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
) => (state: number | string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/processingstate/selectbystateforentity/${entity}/${state}`;

  return http
    .get<Record<string, unknown>>(url);
};

/**
 * Create adapter for processing state fetch operations with ballware.meta.service
 * @param metaServiceBaseUrl Base URL to connect to ballware.meta.service
 * @param tenantServiceBaseUrl Base URL to connect to ballware.tenant.service
 * @param documentServiceBaseUrl Base URL to connect to ballware.document.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendProcessingstateApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  tenantServiceBaseUrl: string,
  documentServiceBaseUrl: string
): MetaProcessingstateApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    selectListForEntity: selectListForEntity(httpClient, metaServiceBaseUrl),    
    selectListMetaAllowedForEntityAndIds: selectListMetaAllowedForEntityAndIds(
      httpClient,
      metaServiceBaseUrl,
      documentServiceBaseUrl
    ),
    selectListTenantAllowedForEntityAndIds: selectListTenantAllowedForEntityAndIds(
      httpClient,
      tenantServiceBaseUrl
    ),
    selectByStateForEntity: selectByStateForEntity(httpClient, metaServiceBaseUrl),
  } as MetaProcessingstateApi;
}
