import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Select list entry of available document list for printing
 */
 export interface DocumentSelectEntry {
  /**
   * Unique identifier of document
   */
  Id: string;

  /**
   * Display name of document
   */
  Name: string;
}

/**
 * Interface for document printing operations
 */
export interface MetaDocumentApi {
  /**
   * Fetch available print documents for business object type
   *
   * @param entity Identifier for business object type
   * @returns Observable containing available print documents for entity
   */
  selectListPrintDocumentsForEntity: (
    entity: string
  ) => Observable<Array<DocumentSelectEntry>>;

  /**
   * Generate viewer url for document
   *
   * @param token Access token required for authentication
   * @param documentId Identifier of user selected document
   * @param ids Ids of selected records to print
   * @returns Observable containing url for rendering document
   */
  viewerUrl: (token: string, documentId: string, ids: string[]) => Observable<string>;
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
    selectListPrintDocumentsForEntity: selectListPrintDocumentsForEntity(
      httpClient,
      metaServiceBaseUrl
    ),
    viewerUrl: viewerUrl(documentServiceBaseUrl),
  } as MetaDocumentApi;
}
