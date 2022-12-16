import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface for documentation viewer operations
 */
 export interface MetaDocumentationApi {
  /**
   * Fetch documentation for business object type
   *
   * @param token Access token required for authentication
   * @param entity Requested business object type
   * @returns Observable containing rich text for rendering documentation
   */
  loadDocumentationForEntity: (
    http: HttpClient,
    entity: string
  ) => Observable<unknown>;
}

const loadDocumentationForEntity = (metaServiceBaseUrl: string) => (
  http: HttpClient,
  entity: string
): Observable<unknown> => {
  const url = `${metaServiceBaseUrl}api/documentation/documentationforentity/${entity}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

/**
 * Create adapter for documentation data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendDocumentationApi(
  metaServiceBaseUrl: string
): MetaDocumentationApi {
  return {
    loadDocumentationForEntity: loadDocumentationForEntity(metaServiceBaseUrl),
  } as MetaDocumentationApi;
}
