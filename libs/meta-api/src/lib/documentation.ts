import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for documentation viewer operations
 */
 export interface MetaDocumentationApi {
  /**
   * Fetch documentation for business object type
   *
   * @param entity Requested business object type
   * @returns Observable containing rich text for rendering documentation
   */
  loadDocumentationForEntity: (
    entity: string
  ) => Observable<unknown>;
}

const loadDocumentationForEntity = (http: HttpClient, metaServiceBaseUrl: string) => (  
  entity: string
): Observable<unknown> => {
  const url = `${metaServiceBaseUrl}/api/documentation/documentationforentity/${entity}`;

  return http
    .get(url, { responseType: 'text' });
};

/**
 * Create adapter for documentation data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendDocumentationApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string
): MetaDocumentationApi {
  return {
    loadDocumentationForEntity: loadDocumentationForEntity(httpClient, metaServiceBaseUrl),
  } as MetaDocumentationApi;
}
