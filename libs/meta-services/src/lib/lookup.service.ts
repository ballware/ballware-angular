import { Observable } from 'rxjs';
import { WithDestroy } from './withdestroy';

/**
 * Data access adapter for fetching lookup data
 */
 export interface LookupStoreDescriptor {
  /**
   * Fetch list of lookup records
   * @returns Observable resolving list of available lookup records
   */
  listFunc: () => Observable<Record<string, unknown>[]>;

  /**
   * Fetch lookup record by id
   * @param id Id of lookup record
   * @returns Observable resolving single lookup record for id
   */
  byIdFunc: (id: string) => Observable<Record<string, unknown>>;
}

/**
 * Data access adapter for fetching autocomplete lookup data
 */
export interface AutocompleteStoreDescriptor {
  /**
   * Fetch list of autocomplete entries
   */
  listFunc: () => Observable<Array<unknown>>;
}

/**
 * Descriptor for lookup and autocomplete datasource
 */
export interface LookupDescriptor {
  /**
   * Type of lookup descriptor
   */
  type: 'lookup' | 'autocomplete';

  /**
   * Data access adapter for fetching data for lookup/autocomplete source
   */
  store: LookupStoreDescriptor | AutocompleteStoreDescriptor;

  /**
   * Value property in fetched data items
   */
  valueMember?: string;

  /**
   * Display property in fetched data items
   */
  displayMember?: string;
}

/**
 * Creator for getting lookup descriptor with additional query param
 * @param param Param attached to lookup query
 */
export type LookupCreator = (param: string | Array<string>) => LookupDescriptor;

/**
 * Creator for getting autocomplete descriptor with additional query param
 * @param param Param attached to autocomplete query
 */
export type AutocompleteCreator = (
  param: string
) => AutocompleteStoreDescriptor;

/**
 * Request object for requesting lookup descriptor
 */
export interface LookupRequest {
  /**
   * Type of requested lookup
   */
  type:
    | 'lookup'
    | 'lookupwithparam'
    | 'pickvalue'
    | 'autocomplete'
    | 'autocompletewithparam'
    | 'state'
    | 'stateallowed';

  /**
   * Unique identifier for lookup in consumer
   */
  identifier: string;

  /**
   * Unique id for lookup  in metadata
   */
  lookupId?: string;

  /**
   * Value property in fetched lookup items specific for consumer (only for lookup, lookupwithparam)
   */
  valueMember?: string;

  /**
   * Display property in fetched lookup items specific for consumer (only for lookup, lookupwithparam)
   */
  displayMember?: string;

  /**
   * Entity identifier (only for pickvalue)
   */
  entity?: string;

  /**
   * Field identifier (only for pickvalue)
   */
  field?: string;
}

export interface LookupServiceApi {
  lookups$: Observable<Record<
      string,
      LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
    >|undefined>;

  getGenericLookupByIdentifier$: Observable<(((
      identifier: string,
      valueExpr: string,
      displayExpr: string
    ) => LookupDescriptor) | undefined)|undefined>;

  requestLookups(request :LookupRequest[]): void;
}

export abstract class LookupService extends WithDestroy() implements LookupServiceApi {

  public abstract lookups$: Observable<Record<
      string,
      LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
    >|undefined>;

  public abstract getGenericLookupByIdentifier$: Observable<(((
      identifier: string,
      valueExpr: string,
      displayExpr: string
    ) => LookupDescriptor) | undefined)|undefined>;

  public abstract requestLookups(request :LookupRequest[]): void;
}
