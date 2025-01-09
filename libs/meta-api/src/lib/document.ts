import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

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

export const META_DOCUMENT_API = new InjectionToken<MetaDocumentApi>('Meta document api');