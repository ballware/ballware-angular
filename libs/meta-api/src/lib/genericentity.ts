import { InjectionToken } from '@angular/core';
import { CrudItem, QueryParams } from '@ballware/meta-model';
import { Observable } from 'rxjs';

/**
 * Interface for generic business object crud operations
 */
 export interface GenericEntityApi {
  /**
   * Query list of business objects by search params
   *
   * @param query Identifier of list query
   * @param params Parameter values for query
   * @returns Observable containing list of resulting business objects
   */
  query: (
    query: string,
    params?: QueryParams
  ) => Observable<Array<CrudItem>>;

  /**
   * Query count of business objects by search params
   *
   * @param query Identifier of list query
   * @param params Parameter values for query
   * @returns Observable containing count of resulting business objects
   */
  count: (
    query: string,
    params?: QueryParams
  ) => Observable<number>;

  /**
   * Fetch single business object by id
   *
   * @param functionIdentifier Identifier of edit function
   * @param id Id of business object
   * @returns Observable containing instance of business object
   */
  byId: (functionIdentifier: string, id: string) => Observable<CrudItem>;

  /**
   * Fetch prepared new instance of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param params Parameter values for initialization of business object
   * @returns Observable containing new generated instance of business object
   */
  new: (functionIdentifier: string, params?: QueryParams) => Observable<CrudItem>;

  /**
   * Save modified instance of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param item Modified instance of business object
   * @returns Observable resolved when save operation has finished
   */
  save: (functionIdentifier: string, item: CrudItem) => Observable<void>;

  /**
   * Save multiple modified instances of business object
   *
   * @param functionIdentifier Identifier of edit function
   * @param items Modified instances of business object
   * @returns Observable resolved when save operation has finished
   */
  saveBatch: (functionIdentifier: string, items: CrudItem[]) => Observable<void>;

  /**
   * Drop existing instance of business object
   *
   * @param id Identifier of business object instance to drop
   * @returns Observable resolved when drop operation has finished
   */
  drop: (id: string) => Observable<void>;

  /**
   * Import business objects from uploaded file
   *
   * @param functionIdentifier Identifier of import function
   * @param file Uploaded file containing objects to import
   * @returns Observable resolved when drop operation has finished
   */
  importItems: (functionIdentifier: string, file: File) => Observable<void>;

  /**
   * Export business objects to download file
   *
   * @param functionIdentifier Identifier of import function
   * @param ids Selected object ids to export
   * @returns Observable resolved when download is ready, containing download url
   */
  exportItems: (functionIdentifier: string, ids: string[]) => Observable<string>;
}

export type GenericEntityApiFactory = (entityBaseUrl: string) => GenericEntityApi;

export const GENERIC_ENTITY_API_FACTORY = new InjectionToken<GenericEntityApiFactory>("Generic entity api factory");