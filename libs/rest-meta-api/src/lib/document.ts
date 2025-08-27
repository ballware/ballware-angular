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


const selectListDocumentsForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (
  entity: string
): Observable<Array<DocumentSelectEntry>> => {
  const url = `${metaServiceBaseUrl}/document/selectlistdocumentsforentity/${entity}`;

  return http
    .get<Array<DocumentSelectEntry>>(url);
};

const designerUrl = (documentServiceSignonUrl: string, documentServiceDesignerUrl: string) => (
  token: string,
  documentId: string
): Observable<string> => {

  const signonUrl = new URL(`${documentServiceSignonUrl}/${encodeURIComponent(token)}`)

  const designerUrl = new URL(`${documentServiceDesignerUrl}`);

  designerUrl.searchParams.append('id', documentId);
  
  signonUrl.searchParams.append('redirect', designerUrl.toString());

  const result = signonUrl.toString();

  return of(result);
};


const viewerUrl = (documentServiceSignonUrl: string, documentServiceViewerUrl: string) => (
  token: string,
  documentId: string,
  ids: string[]
): Observable<string> => {

  const signonUrl = new URL(`${documentServiceSignonUrl}/${encodeURIComponent(token)}`)

  const viewerUrl = new URL(`${documentServiceViewerUrl}`);

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
 * Create adapter for document data operations with ballware.document.service
 * @param documentServiceBaseUrl Base URL to connect to ballware.document.service
 * @param documentServiceSignonUrl Base URL for document signon service
 * @param documentServiceDesignerUrl Base URL for document designer
 * @param documentServiceViewerUrl Base URL for document viewer
 * @returns Adapter object providing data operations
 */
export function createMetaBackendDocumentApi(
  httpClient: HttpClient, 
  documentServiceBaseUrl: string,
  documentServiceSignonUrl: string,
  documentServiceDesignerUrl: string,
  documentServiceViewerUrl: string
): MetaDocumentApi {
  return {
    selectList: selectList(httpClient, documentServiceBaseUrl),
    selectById: selectById(httpClient, documentServiceBaseUrl),

    selectListDocumentsForEntity: selectListDocumentsForEntity(
      httpClient,
      documentServiceBaseUrl
    ),
    designerUrl: designerUrl(documentServiceSignonUrl, documentServiceDesignerUrl),
    viewerUrl: viewerUrl(documentServiceSignonUrl, documentServiceViewerUrl),
    updateDatasources: updateDatasources(httpClient, documentServiceBaseUrl)
  } as MetaDocumentApi;
}
