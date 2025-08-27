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
   * Fetch list for lookup
   *
   * @returns Observable containing result list of lookup query
   */
  selectList: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element for lookup by id
   *
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectById: (id: string) => Observable<Record<string, unknown>>;

  /**
   * Fetch available print documents for business object type
   *
   * @param entity Identifier for business object type
   * @returns Observable containing available print documents for entity
   */
  selectListDocumentsForEntity: (
    entity: string
  ) => Observable<Array<DocumentSelectEntry>>;

  /**
   * Generate viewer url for document
   *
   * @param token Access token required for authentication
   * @param documentId Identifier of user selected document
   * @returns Observable containing url for designing document
   */
  designerUrl: (token: string, documentId: string) => Observable<string>;

  /**
   * Generate viewer url for document
   *
   * @param token Access token required for authentication
   * @param documentId Identifier of user selected document
   * @param ids Ids of selected records to print
   * @returns Observable containing url for rendering document
   */
  viewerUrl: (token: string, documentId: string, ids: string[]) => Observable<string>;

  /**
   * Trigger datasource updates for given ids
   * 
   * @param ids Collection of ids to trigger update for
   * @returns Observable resolving when update is triggered
   */
  updateDatasources: (ids: Array<string>) => Observable<void>;
}

export const META_DOCUMENT_API = new InjectionToken<MetaDocumentApi>('Meta document api');