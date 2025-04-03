import { HttpClient } from '@angular/common/http';
import { DocumentSelectEntry, MetaDocumentApi } from '@ballware/meta-api';
import { Observable, of } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}api/document/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}api/document/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}


const selectListPrintDocumentsForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
): Observable<Array<DocumentSelectEntry>> => {
  const url = `${metaServiceBaseUrl}api/document/selectlistdocumentsforentity/${entity}`;

  return http
    .get<Array<DocumentSelectEntry>>(url);
};

const viewerUrl = (documentServiceBaseUrl: string) => (
  token: string,
  documentId: string,
  ids: string[]
): Observable<string> => {

  const url = new URL(`${documentServiceBaseUrl}/viewer`);

  url.searchParams.append('token', token);
  url.searchParams.append('?docId', documentId);

  ids.forEach(id => url.searchParams.append('id', id));
  
  const result = url.toString();

  return of(result);
};

/**
 * Create adapter for document data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendDocumentApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string,
  documentServiceBaseUrl: string
): MetaDocumentApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),

    selectListPrintDocumentsForEntity: selectListPrintDocumentsForEntity(
      httpClient,
      metaServiceBaseUrl
    ),
    viewerUrl: viewerUrl(documentServiceBaseUrl),
  } as MetaDocumentApi;
}
