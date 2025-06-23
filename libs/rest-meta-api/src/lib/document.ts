import { HttpClient } from '@angular/common/http';
import { DocumentSelectEntry, MetaDocumentApi } from '@ballware/meta-api';
import { Observable, of } from 'rxjs';

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/document/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/document/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}


const selectListPrintDocumentsForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
): Observable<Array<DocumentSelectEntry>> => {
  const url = `${metaServiceBaseUrl}/document/selectlistdocumentsforentity/${entity}`;

  return http
    .get<Array<DocumentSelectEntry>>(url);
};

const designerUrl = (documentServiceBaseUrl: string) => (
  token: string,
  documentId: string
): Observable<string> => {

  const signonUrl = new URL(`${documentServiceBaseUrl}/signon/${encodeURIComponent(token)}`)

  const designerUrl = new URL(`${documentServiceBaseUrl}/designer`);

  designerUrl.searchParams.append('id', documentId);
  
  signonUrl.searchParams.append('redirect', designerUrl.toString());

  const result = signonUrl.toString();

  return of(result);
};


const viewerUrl = (documentServiceBaseUrl: string) => (
  token: string,
  documentId: string,
  ids: string[]
): Observable<string> => {

  const signonUrl = new URL(`${documentServiceBaseUrl}/signon/${encodeURIComponent(token)}`)

  const viewerUrl = new URL(`${documentServiceBaseUrl}/viewer`);

  viewerUrl.searchParams.append('docId', documentId);

  ids.forEach(id => viewerUrl.searchParams.append('id', id));
  
  signonUrl.searchParams.append('redirect', viewerUrl.toString());

  const result = signonUrl.toString();

  return of(result);
};

const updateDatasources = (http: HttpClient, documentServiceBaseUrl: string) => (ids: Array<string>): Observable<void> => {

  const url = `${documentServiceBaseUrl}/document/updatedatasources?id=${ids.map(id => encodeURIComponent(id)).join('&id=')}`;

  return http
    .post<void>(url, null);
}

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
    designerUrl: designerUrl(documentServiceBaseUrl),
    viewerUrl: viewerUrl(documentServiceBaseUrl),
    updateDatasources: updateDatasources(httpClient, documentServiceBaseUrl)
  } as MetaDocumentApi;
}
