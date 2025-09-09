import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for fetching lookups
 */
 export interface MetaLookupApi extends SelectableMetaApi {

  /**
   * Fetch list by lookup
   *
   * @param lookup Identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookup: (
    lookup: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup and id
   *
   * @param lookup Id of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookup: (
    lookup: string,
    id: string
  ) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup identifier
   *
   * @param identifier Unique identifier of lookup definition
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupIdentifier: (
    identifier: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup identifier and id
   *
   * @param identifier Unique identifier of lookup definition
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupIdentifier: (
    identifier: string,
    id: string
  ) => Observable<Record<string, unknown>>;

  /**
   * Fetch list by lookup with param
   *
   * @param lookup Identifier of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing result list of lookup query
   */
  selectListForLookupWithParam: (
    lookup: string,
    param: unknown
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element by lookup with param and id
   *
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectByIdForLookupWithParam: (
    lookup: string,
    param: unknown,
    id: string
  ) => Observable<Record<string, unknown>>;

  /**
   * Fetch list of proposals for lookup
   *
   * @param lookup Id of lookup definition
   * @returns Observable containing proposals
   */
  autoCompleteForLookup: (
    lookup: string
  ) => Observable<Array<unknown>>;

  /**
   * Fetch list of proposals for lookup with param
   *
   * @param lookup Id of lookup definition
   * @param param Additional query param for lookup
   * @returns Observable containing proposals
   */
  autoCompleteForLookupWithParam: (
    lookup: string,
    param: unknown
  ) => Observable<Array<unknown>>;
}

export const META_LOOKUP_API = new InjectionToken<MetaLookupApi>('Meta lookup api');
